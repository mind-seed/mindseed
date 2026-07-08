import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { AuthorDtoSchema } from "./author";

export const ReportReasonSchema = z.string().min(1).max(200);

export const ReportDtoSchema = z.object({
  id: z.int(),
  reason: ReportReasonSchema,
  createdAt: dateSerializerCodec,
  postId: z.int().nullable(),
  commentId: z.int().nullable(),
  range: z.enum(["POST", "COMMENT"]),
  user: AuthorDtoSchema.nullable(),
});
