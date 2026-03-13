import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    return this.userRepository.save(user);
  }
}
