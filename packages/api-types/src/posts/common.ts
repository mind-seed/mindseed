import z from "zod";
import { dateTimeCodec } from "../common/date-time-codec";

export const PostContentSchema = z.string().min(1).max(200);

export const PostCategorySchema = z.enum(["dummy1", "dummy2", "dummy3"]);

export const PostAttachmentsSchema = z.array(z.int()).max(3);

export const AttachmentDtoSchema = z.object({
  id: z.int(),
  url: z.url(),
});

export type AttachmentDto = z.output<typeof AttachmentDtoSchema>;

export const PostAuthorNicknameSchema = z.string().min(2).max(10);

export const PostAuthorDtoSchema = z.object({
  nickname: PostAuthorNicknameSchema,
});

export const PostDtoSchema = z.object({
  id: z.int(),
  content: PostContentSchema,
  category: PostCategorySchema,
  author: PostAuthorDtoSchema,
  attachments: z.array(AttachmentDtoSchema),
  likeCount: z.int(),
  isOwner: z.boolean(),
  isLiked: z.boolean(),
  createdAt: dateTimeCodec,
  updatedAt: dateTimeCodec,
});

export type PostDto = z.output<typeof PostDtoSchema>;

// shared error codes

export const PostNotFoundErrorCode = "POST_NOT_FOUND";
export const NotPostAuthorErrorCode = "NOT_POST_AUTHOR";
