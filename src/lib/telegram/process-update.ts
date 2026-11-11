import { and, eq } from "drizzle-orm";

import type { getDb } from "@/db";
import { telegramUpdates } from "@/db/schema";

import { processTelegramCommand } from "./handler";
import type { ParsedCommand } from "./parse";

type TelegramDatabase = ReturnType<typeof getDb>;

export type TelegramUpdateResult = {
  replyText: string;
  shouldSendReply: boolean;
};

export async function processTelegramUpdate(
  db: TelegramDatabase,
  updateId: number,
  chatId: string,
  command: ParsedCommand,
): Promise<TelegramUpdateResult> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(telegramUpdates)
      .values({
        updateId,
        chatId,
        replyText: "",
        replyStatus: "pending",
      })
      .onConflictDoNothing()
      .returning({ updateId: telegramUpdates.updateId });

    if (inserted.length === 0) {
      const [existing] = await tx
        .select({
          replyText: telegramUpdates.replyText,
          replyStatus: telegramUpdates.replyStatus,
        })
        .from(telegramUpdates)
        .where(eq(telegramUpdates.updateId, updateId))
        .limit(1);

      if (!existing) {
        throw new Error(`Telegram update ${updateId} was not found after conflict.`);
      }

      return {
        replyText: existing.replyText,
        shouldSendReply: existing.replyStatus === "pending",
      };
    }

    const replyText = await processTelegramCommand(tx, command);

    await tx
      .update(telegramUpdates)
      .set({ replyText })
      .where(eq(telegramUpdates.updateId, updateId));

    return { replyText, shouldSendReply: true };
  });
}

export async function markTelegramReplySent(
  db: TelegramDatabase,
  updateId: number,
): Promise<void> {
  await db
    .update(telegramUpdates)
    .set({
      replyStatus: "sent",
      repliedAt: new Date(),
    })
    .where(
      and(
        eq(telegramUpdates.updateId, updateId),
        eq(telegramUpdates.replyStatus, "pending"),
      ),
    );
}
