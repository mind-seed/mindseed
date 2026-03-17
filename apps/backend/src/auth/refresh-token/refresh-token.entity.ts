import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/user.entity";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;
}
