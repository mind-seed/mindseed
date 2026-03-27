import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";

export type CreateUserProfile = {
  nickname: string;
  age: number;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
}
