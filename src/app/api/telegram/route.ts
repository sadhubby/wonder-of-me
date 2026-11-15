import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getTelegramConfig,
  MissingEnvironmentError,
} from "@/lib/env";
import {
  markTelegramReplySent,
  processTelegramUpdate,
} from "@/lib/telegram/process-update";
import {
  parseTelegramCommand,
  type ParsedCommand,
} from "@/lib/telegram/parse";
import {
  sendTelegramMessage,
  TelegramSendError,
} from "@/lib/telegram/send";
import { getDb } from "@/db";

export const maxDuration = 30;

const updateSchema = z
  .object({
    update_id: z.number().int().nonnegative(),
    message: z
      .object({
        chat: z.object({
          id: z.union([z.number(), z.string()]),
        }),
        text: z.string().max(4096).optional(),
      })
      .optional(),
  })
  .passthrough();

function secureCompare(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function POST(request: Request) {
  let config;

  try {
    config = getTelegramConfig();
  } catch (error) {
    if (error instanceof MissingEnvironmentError) {
      console.error("[telegram] Missing configuration", error.message);
      return NextResponse.json(
        { ok: false, error: "Telegram gateway is not configured." },
        { status: 503 },
      );
    }

    throw error;
  }

  const providedSecret = request.headers.get(
    "x-telegram-bot-api-secret-token",
  );

  if (
    !providedSecret ||
    !secureCompare(providedSecret, config.webhookSecret)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const message = parsed.data.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  if (!config.chatIds.includes(chatId)) {
    return NextResponse.json({ ok: true });
  }

  let command: ParsedCommand | null = null;

  try {
    command = parseTelegramCommand(message.text);
  } catch (error) {
    console.error("[telegram] Failed to parse command", error);
  }

  if (!command) {
    return NextResponse.json({ ok: true });
  }

  const db = getDb();
  let result: { replyText: string; shouldSendReply: boolean };

  try {
    result = await processTelegramUpdate(
      db,
      parsed.data.update_id,
      chatId,
      command,
    );
  } catch (error) {
    console.error("[telegram] Update failed", {
      updateId: parsed.data.update_id,
      chatId,
      outcome: "processing_failed",
      failureCategory: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json(
      { ok: false, error: "Update processing failed." },
      { status: 500 },
    );
  }

  if (!result.shouldSendReply) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendTelegramMessage(config.token, chatId, result.replyText);
    await markTelegramReplySent(db, parsed.data.update_id);
  } catch (error) {
    if (error instanceof TelegramSendError) {
      console.error("[telegram] Reply failed", {
        updateId: parsed.data.update_id,
        chatId,
        outcome: "reply_pending",
        failureCategory: error.code,
        code: error.code,
        status: error.status,
        telegramErrorCode: error.telegramErrorCode,
        retryAfterSeconds: error.retryAfterSeconds,
      });
    } else {
      console.error("[telegram] Reply failed", {
        updateId: parsed.data.update_id,
        chatId,
        outcome: "reply_pending",
        failureCategory: "unknown",
      });
    }
    return NextResponse.json(
      { ok: false, error: "Reply delivery failed." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
