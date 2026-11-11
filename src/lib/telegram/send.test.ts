import { describe, expect, it, vi } from "vitest";

import {
  sendTelegramMessage,
  TelegramSendError,
} from "./send";

describe("sendTelegramMessage", () => {
  it("accepts a successful Telegram response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
          status: 200,
        }),
      ),
    );

    await expect(
      sendTelegramMessage("test-token", "123", "hello"),
    ).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  it("exposes rate-limit details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error_code: 429,
            description: "Too Many Requests",
            parameters: { retry_after: 7 },
          }),
          { status: 429 },
        ),
      ),
    );

    const error = await sendTelegramMessage("test-token", "123", "hello").catch(
      (value: unknown) => value,
    );

    expect(error).toBeInstanceOf(TelegramSendError);
    expect(error).toMatchObject({
      code: "rate_limited",
      status: 429,
      telegramErrorCode: 429,
      retryAfterSeconds: 7,
    });

    vi.unstubAllGlobals();
  });

  it("distinguishes malformed responses and network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not-json", { status: 502 })),
    );

    await expect(
      sendTelegramMessage("test-token", "123", "hello"),
    ).rejects.toMatchObject({
      code: "invalid_response",
      status: 502,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connection refused")),
    );

    await expect(
      sendTelegramMessage("test-token", "123", "hello"),
    ).rejects.toMatchObject({
      code: "network_error",
    });

    vi.unstubAllGlobals();
  });
});
