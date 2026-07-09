import { describe, expect, it } from "vitest";
import { testPrisma } from "./helpers/db.js";

describe("test infrastructure", () => {
  it("connects to the test database and starts empty", async () => {
    const userCount = await testPrisma.user.count();
    expect(userCount).toBe(0);
  });
});
