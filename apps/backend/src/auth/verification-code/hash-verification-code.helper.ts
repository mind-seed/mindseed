import crypto from "node:crypto";

export function hashVerificationCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
