import assert from "node:assert/strict";
import test from "node:test";
import { AuthError } from "@gspb-cs/auth";

test("AuthError carries HTTP status", () => {
  const error = new AuthError("nope", 401);
  assert.equal(error.status, 401);
});
