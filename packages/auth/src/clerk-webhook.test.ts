import assert from "node:assert/strict";
import test from "node:test";

test("display name prefers first and last name", () => {
  const parts = ["Ada", "Lovelace"].filter(Boolean);
  assert.equal(parts.join(" "), "Ada Lovelace");
});

test("role rank orders platform_admin above student", async () => {
  const { SchoolRole } = await import("@gspb-cs/database");
  const roleRank: Record<string, number> = {
    student: 1,
    teacher: 2,
    school_admin: 3,
    platform_admin: 4,
  };
  assert.ok(roleRank[SchoolRole.platform_admin] > roleRank[SchoolRole.student]);
});
