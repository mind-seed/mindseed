import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, LessThan, Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { randomBytes } from "crypto";
import { RefreshToken } from "./refresh-token.entity";
import { Temporal } from "@js-temporal/polyfill";

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * user id와 refresh token 사이의 연관 로직을 담당한다.
 */
@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /*
   * userId에 대한 새 refresh token을 생성 및 저장한다.
   * @returns 새로 생성된 refresh token
   */
  async issue(userId: number): Promise<string> {
    const refreshToken = await this.createRefreshToken(userId);
    await this.refreshTokenRepository.save(refreshToken);
    return refreshToken.token;
  }

  /*
   * token과 연관된 user id를 찾는다.
   * 해당 refresh token이 없거나 만료된 것일 경우 null을 리턴한다.
   * @returns 연관된 user id
   */
  async findUserIdByToken(token: string): Promise<number | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    if (
      !refreshToken ||
      Temporal.Instant.compare(refreshToken.expiresAt, Temporal.Now.instant()) <
        0
    ) {
      return null;
    }
    return refreshToken.userId;
  }

  /*
   * userId에 대해 기존에 존재했던 token을 삭제하고, 새로운 것을 발급한다.
   * @returns 새롭게 발급된 token
   */
  async rotate(userId: number): Promise<string> {
    const refreshToken = await this.dataSource.transaction(async (manager) => {
      // 2026-03-16: NestJS에서 이게 최선일까?
      const refreshTokenRepository = manager.getRepository(RefreshToken);
      await refreshTokenRepository.delete({ userId });
      const refreshToken = await this.createRefreshToken(userId);
      await refreshTokenRepository.save(refreshToken);
      return refreshToken;
    });
    return refreshToken.token;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteExpired(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(Temporal.Now.instant()),
    });
  }

  /*
   * token을 생성하지만 save 하지는 않는다.
   */
  private async createRefreshToken(userId: number): Promise<RefreshToken> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = Temporal.Now.instant().add({ seconds: TTL_SECONDS });
    const refreshToken = this.refreshTokenRepository.create({
      token,
      expiresAt,
      userId,
    });
    return refreshToken;
  }
}
