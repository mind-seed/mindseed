import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CounselCategory, CounselEntry } from "./entities/counsel-entry.entity";
import {
  CounselAlreadyRespondedError,
  CounselNotFoundError,
  NotCounselAuthorError,
} from "./counsel.errors";

export type CreateCounselOptions = {
  userId: number;
  title: string;
  content: string;
  category: CounselCategory;
};

export type UpdateCounselOptions = {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: CounselCategory;
};

/**
 * counsel entry의 mutation과 관련된 부분을 담당한다.
 */
@Injectable()
export class CounselMutationService {
  constructor(
    @InjectRepository(CounselEntry)
    private readonly counselEntryRepository: Repository<CounselEntry>,
  ) {}

  /**
   * options를 기반으로 counsel entry를 생성한다.
   * assumption: options.userId: USER role로 존재하는 사용자의 id이다.
   * @returns 생성된 counsel entry
   */
  async createCounselEntry(
    options: CreateCounselOptions,
  ): Promise<CounselEntry> {
    return this.counselEntryRepository.save(
      this.counselEntryRepository.create({
        authorId: options.userId,
        title: options.title,
        content: options.content,
        category: options.category,
        responseContent: null,
        responderId: null,
      }),
    );
  }

  /**
   * options.userId의 사용자가 counsel entry의 작성자인 경우, entry를
   * 업데이트한다.
   * assumption: options.userId: USER role로 존재하는 사용자의 id이다.
   */
  async updateCounselEntry({
    id,
    userId,
    title,
    content,
    category,
  }: UpdateCounselOptions): Promise<void> {
    const counsel = await this.counselEntryRepository.findOneBy({ id });
    if (!counsel) {
      throw new CounselNotFoundError();
    }
    if (counsel.authorId !== userId) {
      throw new NotCounselAuthorError();
    }

    await this.counselEntryRepository.save({
      ...counsel,
      title,
      content,
      category,
    });
  }

  /**
   * userId의 사용자가 counsel entry의 작성자인 경우, entry를 삭제한다.
   * assumption: userId: USER role로 존재하는 사용자의 id이다.
   */
  async deleteCounselEntry(id: number, userId: number): Promise<void> {
    const counsel = await this.counselEntryRepository.findOneBy({ id });
    if (!counsel) {
      throw new CounselNotFoundError();
    }
    if (counsel.authorId !== userId) {
      throw new NotCounselAuthorError();
    }

    await this.counselEntryRepository.delete(id);
  }

  /**
   * responderId와 responseContent를 기반으로 counsel entry에 응답을 추가한다.
   * assumption: responderId: ADMIN role로 존재하는 사용자의 id이다.
   */
  async respondToCounselEntry(
    id: number,
    responderId: number,
    responseContent: string,
  ): Promise<void> {
    const counsel = await this.counselEntryRepository.findOneBy({ id });
    if (!counsel) {
      throw new CounselNotFoundError();
    }
    if (counsel.responseContent !== null) {
      throw new CounselAlreadyRespondedError();
    }

    await this.counselEntryRepository.save({
      ...counsel,
      responderId,
      responseContent,
    });
  }
}
