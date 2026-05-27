import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { UserProfile } from "./entities/user-profile.entity";

export type CreateUserProfile = {
  nickname: string;
  age: number;
};

export type UpdateUserProfileOptions = {
  nickname?: string;
  characterIndex?: number;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: { profile: true },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
  }

  /*
   * USER role로 사용자를 생성한다.
   * @returns 생성된 사용자
   */
  async create(
    email: string,
    hashedPassword: string,
    profile: CreateUserProfile,
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.USER,
      profile,
    });
    return this.userRepository.save(user);
  }

  /*
   * userId에 해당하는 사용자의 profile을 업데이트한다.
   * @param userId USER role의 사용자 id
   * @param options 변경할 profile 정보
   */
  async updateProfile(
    userId: number,
    options: UpdateUserProfileOptions,
  ): Promise<void> {
    await this.userProfileRepository.update(
      {
        userId,
      },
      options,
    );
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword },
    );
  }

  async softDelete(userId: number): Promise<void> {
    await this.userRepository.softDelete({ id: userId });
  }
}
