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

  @Column()
  minLevel: number;

  @Column({ type: "enum", enum: TestCategory })
  category: TestCategory;

  @Column()
  points: number;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;
}
