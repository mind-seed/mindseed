import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum TestCategory {
  ANXIETY = "ANXIETY",
  DEPRESSION = "DEPRESSION",
  STRESS = "STRESS",
}

@Entity({ name: "mission" })
export class Mission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: "min_level" })
  minLevel: number;

  @Column({ type: "enum", enum: TestCategory })
  category: TestCategory;

  @Column()
  points: number;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;
}
