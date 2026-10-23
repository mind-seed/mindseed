import { Temporal } from "@js-temporal/polyfill";
import {
  Column,
  ColumnOptions,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Temporal API 사용을 위한 helper decorators
 * Entity들에서는 timestampz 타입만 사용한다는 전제하에 작성되었습니다.
 */

// 2026-05-08 transformer는 arbritrary value를 받을 수 있으며, query 시의
// operator (Not 등) 도 이에 해당합니다. 따라서 primitive 만 받을 것이라고
// 가정해서는 안 됩니다
const temporalInstantTransformer = {
  to: (instant: unknown) => {
    return instant instanceof Temporal.Instant
      ? new Date(Number(instant.epochMilliseconds))
      : instant;
  },
  from: (instant: unknown) => {
    return instant instanceof Date || typeof instant === "string"
      ? Temporal.Instant.fromEpochMilliseconds(new Date(instant).getTime())
      : instant;
  },
};

export function TimestampColumn(options?: ColumnOptions): PropertyDecorator {
  return Column({
    type: "timestamptz",
    ...options,
    transformer: temporalInstantTransformer,
  });
}

export function CreateTimestampColumn(
  options?: ColumnOptions,
): PropertyDecorator {
  return CreateDateColumn({
    type: "timestamptz",
    ...options,
    transformer: temporalInstantTransformer,
  });
}

export function UpdateTimestampColumn(
  options?: ColumnOptions,
): PropertyDecorator {
  return UpdateDateColumn({
    type: "timestamptz",
    ...options,
    transformer: temporalInstantTransformer,
  });
}

export function DeleteTimestampColumn(
  options?: ColumnOptions,
): PropertyDecorator {
  return DeleteDateColumn({
    type: "timestamptz",
    ...options,
    transformer: temporalInstantTransformer,
  });
}
