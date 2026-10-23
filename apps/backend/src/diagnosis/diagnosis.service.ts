import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DiagnosisNotFoundError } from "./diagnosis.errors";
import { DiagnosisEntry } from "./entities/diagnosis-entry.entity";

export type CreateDiagnosisEntryOptions = {
  userId: number;
  depressionScore: number;
  anxietyScore: number;
  stressScore: number;
};

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(DiagnosisEntry)
    private readonly diagnosisEntryRepository: Repository<DiagnosisEntry>,
  ) {}

  async createDiagnosisEntry(
    options: CreateDiagnosisEntryOptions,
  ): Promise<DiagnosisEntry> {
    const diagnosisEntry = await this.diagnosisEntryRepository.save(
      this.diagnosisEntryRepository.create({
        userId: options.userId,
        depressionScore: options.depressionScore,
        anxietyScore: options.anxietyScore,
        stressScore: options.stressScore,
      }),
    );
    return diagnosisEntry;
  }

  /**
   * 사용자가 가장 최근에 자가진단한 결과를 조회한다.
   * @param userId 조회할 사용자 id
   * @returns 가장 최근 자가진단 결과
   * @throws DiagnosisNotFoundError - 자가진단 기록이 존재하지 않는 경우
   */
  async getLatestDiagnosisEntry(userId: number): Promise<DiagnosisEntry> {
    const diagnosisEntry = await this.diagnosisEntryRepository.findOne({
      where: { userId },
      order: { createdAt: "DESC", id: "DESC" },
    });
    if (!diagnosisEntry) {
      throw new DiagnosisNotFoundError();
    }
    return diagnosisEntry;
  }
}
