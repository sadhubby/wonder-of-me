import { describe, expect, it } from "vitest";

import { parseTelegramCommand } from "./parse";

describe("parseTelegramCommand", () => {
  it("parses a gym command with duration and exercise details", () => {
    expect(
      parseTelegramCommand("/gym push 45 | bench press 4x8, cable fly 3x12"),
    ).toEqual({
      type: "gym",
      split: "push",
      durationMinutes: 45,
      exercises: [
        { name: "bench press", sets: 4, reps: 8 },
        { name: "cable fly", sets: 3, reps: 12 },
      ],
      notes: null,
    });
  });

  it("parses an unquoted reading command", () => {
    expect(parseTelegramCommand("/read Dune 32 45")).toEqual({
      type: "read",
      title: "Dune",
      pages: 32,
      minutes: 45,
    });
  });

  it("parses a quoted reading title", () => {
    expect(
      parseTelegramCommand('/read "The Name of the Wind" 24 40'),
    ).toEqual({
      type: "read",
      title: "The Name of the Wind",
      pages: 24,
      minutes: 40,
    });
  });

  it("parses a meal with partial macros", () => {
    expect(parseTelegramCommand("/eat 620 45 60 chicken bowl")).toEqual({
      type: "eat",
      calories: 620,
      protein: 45,
      carbs: 60,
      fat: 0,
      description: "chicken bowl",
    });
  });

  it("rejects a reading command without pages", () => {
    const result = parseTelegramCommand("/read Dune");
    expect(result?.type).toBe("error");
  });

  it("returns help for /start", () => {
    expect(parseTelegramCommand("/start")).toEqual({ type: "help" });
  });

  it("parses status, book, and finish commands", () => {
    expect(parseTelegramCommand("/status")).toEqual({ type: "status" });
    expect(
      parseTelegramCommand(
        '/book "Dune" | author=Frank Herbert pages=412 status=reading',
      ),
    ).toEqual({
      type: "book",
      title: "Dune",
      author: "Frank Herbert",
      totalPages: 412,
      status: "reading",
    });
    expect(parseTelegramCommand('/finish "Dune"')).toEqual({
      type: "finish",
      title: "Dune",
    });
  });

  it("rejects invalid book options and missing finish titles", () => {
    expect(parseTelegramCommand("/book Dune | pages=0")).toMatchObject({
      type: "error",
      command: "book",
    });
    expect(parseTelegramCommand("/book Dune | status=unknown")).toMatchObject({
      type: "error",
      command: "book",
    });
    expect(parseTelegramCommand("/finish")).toMatchObject({
      type: "error",
      command: "finish",
    });
  });

  it("parses supported undo commands", () => {
    expect(parseTelegramCommand("/undo gym")).toEqual({
      type: "undo",
      target: "gym",
    });
    expect(parseTelegramCommand("/undo READ")).toEqual({
      type: "undo",
      target: "read",
    });
  });

  it("rejects unsupported undo targets", () => {
    expect(parseTelegramCommand("/undo")).toMatchObject({
      type: "error",
      command: "undo",
    });
    expect(parseTelegramCommand("/undo book")).toMatchObject({
      type: "error",
      command: "undo",
    });
  });

  it("ignores non-command text", () => {
    expect(parseTelegramCommand("hello there")).toBeNull();
  });
});
