import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { RefreshTokenStore } from "./refresh-token.store";

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class RefreshTokenService {
  constructor(private readonly store: RefreshTokenStore) {}

  async issue(userId: number): Promise<string> {
    const token = randomBytes(32).toString("hex");
    await this.store.save(userId, token, TTL_SECONDS);
    return token;
  }

  async verify(userId: number, token: string): Promise<boolean> {
    const stored = await this.store.find(userId);
    return stored === token;
  }

  async revoke(userId: number): Promise<void> {
    await this.store.remove(userId);
  }
}
