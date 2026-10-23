import { DataSource } from "typeorm";
import PGMem, { DataType } from "pg-mem";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";

export async function initializePgMem(entities: EntityClassOrSchema[]) {
  const db = PGMem.newDb();

  db.public.registerFunction({
    name: "version",
    returns: DataType.text,
    implementation: () => "PostgreSQL 16.0",
  });

  db.public.registerFunction({
    name: "current_database",
    implementation: () => "test-database",
  });

  const dataSource = (await db.adapters.createTypeormDataSource({
    type: "postgres",
    entities,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
  })) as DataSource;

  await dataSource.initialize();

  return { dataSource, backup: db.backup() };
}
