import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { AuthorDtoSchema } from "./author";

export const CommentContentSchema = z.string().min(1).max(200);

export const CommentDtoSchema = z.object({
  id: z.int(),
  content: CommentContentSchema,
  author: AuthorDtoSchema,
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});
