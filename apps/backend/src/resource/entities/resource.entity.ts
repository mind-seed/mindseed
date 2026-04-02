import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;
}
