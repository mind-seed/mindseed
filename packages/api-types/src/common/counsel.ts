import z from "zod";
import { dateSerializerCodec } from "./codecs";

export const CounselCategorySchema = z.enum([
  "anxiety",
  "depression",
  "stress",
  "other",
]);

export const CounselTitleSchema = z.string().min(1).max(50);
export const CounselContentSchema = z.string().min(1).max(500);
export const CounselResponseSchema = z.string().min(1).max(500);

export const CounselDtoSchema = z.object({
  id: z.int(),
  title: CounselTitleSchema,
  content: CounselContentSchema,
  category: CounselCategorySchema,
  createdAt: dateSerializerCodec,
  response: CounselResponseSchema.optional(),
});

export const CounselSummaryDtoSchema = z.object({
  id: z.int(),
  title: CounselTitleSchema,
  category: CounselCategorySchema,
  createdAt: dateSerializerCodec,
  responded: z.boolean(),
});
