import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  UpdateTimestampColumn,
} from "src/database/decorators/temporal.decorators";

export enum ResourceType {
  ARTICLE = "ARTICLE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum ResourceCategory {
  DUMMY1 = "DUMMY1",
  DUMMY2 = "DUMMY2",
  DUMMY3 = "DUMMY3",
}

@Entity({ name: "resource" })
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "enum", enum: ResourceType })
  type: ResourceType;

  @Column({ type: "enum", enum: ResourceCategory })
  category: ResourceCategory;

  @Column()
  url: string;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;
}
