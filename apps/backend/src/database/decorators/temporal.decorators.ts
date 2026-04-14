import { Temporal } from "@js-temporal/polyfill";
import {
  Column,
  ColumnOptions,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Temporal API 사용을 위한 helper decorators
 * Entity들에서는 timestampz 타입만 사용한다는 전제하에 작성되었습니다.
 */

const temporalInstantTransformer = {
  to: (
    instant: Temporal.Instant | null | undefined,
  ): Date | null | undefined => {
    return instant != null
      ? new Date(Number(instant.epochMilliseconds))
      : instant;
  },
  from: (
    instant: Date | string | null | undefined,
  ): Temporal.Instant | null | undefined => {
    return instant != null
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
