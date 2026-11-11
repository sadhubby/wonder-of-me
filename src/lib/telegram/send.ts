export type TelegramSendErrorCode =
  | "http_error"
  | "api_error"
  | "invalid_response"
  | "network_error"
  | "rate_limited";

export class TelegramSendError extends Error {
  constructor(
    message: string,
    readonly code: TelegramSendErrorCode,
    readonly status: number | null = null,
    readonly telegramErrorCode: number | null = null,
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "TelegramSendError";
  }
}

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );
  } catch (error) {
    throw new TelegramSendError(
      `Telegram sendMessage request failed: ${error instanceof Error ? error.message : "Unknown network error"}`,
      "network_error",
    );
  }

  const result = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error_code?: number;
    description?: string;
    parameters?: { retry_after?: number };
  } | null;

  if (!result) {
    throw new TelegramSendError(
      `Telegram sendMessage returned an invalid response (${response.status}).`,
      "invalid_response",
      response.status,
    );
  }

  if (!response.ok || !result.ok) {
    const retryAfterSeconds = result.parameters?.retry_after ?? null;
    const code = retryAfterSeconds !== null || result.error_code === 429
      ? "rate_limited"
      : response.ok
        ? "api_error"
        : "http_error";

    throw new TelegramSendError(
      `Telegram sendMessage failed (${response.status}): ${result.description ?? "Unknown error"}`,
      code,
      response.status,
      result.error_code ?? null,
      retryAfterSeconds,
    );
  }
}
