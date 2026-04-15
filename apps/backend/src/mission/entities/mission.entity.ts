import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  UpdateTimestampColumn,
} from "src/database/decorators/temporal.decorators";

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

  @CreateTimestampColumn({ name: "created_at" })
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn({ name: "updated_at" })
  updatedAt: Temporal.Instant;
}
