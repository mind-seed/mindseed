import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { AuthorDtoSchema } from "./author";

export const ReportReasonSchema = z.string().min(1).max(200);

export const ReportDtoSchema = z.object({
  id: z.int(),
  reason: ReportReasonSchema,
  isProcessed: z.boolean(),
  processedAt: dateSerializerCodec.nullable(),
  result: z.string().nullable(),
  createdAt: dateSerializerCodec,
  postId: z.int(),
  user: AuthorDtoSchema,
  processedBy: AuthorDtoSchema.nullable(),
});
