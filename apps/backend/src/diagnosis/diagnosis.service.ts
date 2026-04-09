import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
}
