import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { AuthorDtoSchema } from "./author";

export const CommentContentSchema = z.string().min(1).max(200);

export const DeletionTypeSchema = z.enum(["author", "admin"]);

export const ActiveCommentDtoSchema = z.object({
  type: z.literal("active"),
  id: z.int(),
  content: CommentContentSchema,
  author: AuthorDtoSchema,
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const DeletedCommentDtoSchema = z.object({
  type: z.literal("deleted"),
  id: z.int(),
  deletionType: DeletionTypeSchema,
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const AuthorDeletedCommentDtoSchema = z.object({
  type: z.literal("authorDeleted"),
  id: z.int(),
  content: CommentContentSchema,
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const CommentDtoSchema = z.discriminatedUnion("type", [
  ActiveCommentDtoSchema,
  DeletedCommentDtoSchema,
  AuthorDeletedCommentDtoSchema,
]);
