import type { ResultSet } from "@libsql/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    connection: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getDb } from "@/db";
import { GET } from "./route";

const database = {
  run: vi.fn(),
} as unknown as ReturnType<typeof getDb>;

const healthyResult: ResultSet = {
  columns: [],
  columnTypes: [],
  rows: [],
  rowsAffected: 0,
  lastInsertRowid: undefined,
  toJSON: () => ({}),
};

describe("health endpoint", () => {
  it("reports a healthy application and database", async () => {
    vi.mocked(getDb).mockReturnValue(database);
    vi.mocked(database.run).mockResolvedValue(healthyResult);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, database: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(database.run).toHaveBeenCalledOnce();
  });

  it("returns service unavailable when the database check fails", async () => {
    vi.mocked(getDb).mockReturnValue(database);
    vi.mocked(database.run).mockRejectedValue(
      new Error("database unavailable"),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await GET();

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        ok: false,
        database: "unavailable",
      });
      expect(response.headers.get("cache-control")).toBe("no-store");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("returns service unavailable when configuration is invalid", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("invalid database configuration");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await GET();

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        ok: false,
        database: "unavailable",
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});
