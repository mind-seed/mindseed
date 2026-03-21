import * as z from "zod";

export const successResponseDtoSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const errorResponseDtoSchema = <E extends z.ZodTypeAny>(errorCodeSchema: E) =>
  z.object({
    success: z.literal(false),
    statusCode: z.int(),
    errorCode: errorCodeSchema.optional(),
  });

export const responseDtoSchema = <T extends z.ZodTypeAny, E extends z.ZodTypeAny>(
  dataSchema: T,
  errorCodeSchema: E
) =>
  z.discriminatedUnion("success", [
    successResponseDtoSchema(dataSchema),
    errorResponseDtoSchema(errorCodeSchema),
  ]);

