import z from "zod";
import { dateSerializerCodec } from "../common/codecs";
import { CommentContentSchema } from "src/post-comments/common";

export const PostContentSchema = z.string().min(1).max(200);
export const PostCategorySchema = z.enum(["dummy1", "dummy2", "dummy3"]);

export const PostAttachmentsSchema = z.array(z.int()).max(3);

export const AttachmentDtoSchema = z.object({
  id: z.int(),
  url: z.url(),
});

export const PostAuthorNicknameSchema = z.string().min(2).max(10);

export const AuthorDtoSchema = z.object({
  nickname: PostAuthorNicknameSchema,
});

export const PostDtoSchema = z.object({
  id: z.int(),
  content: PostContentSchema,
  category: PostCategorySchema,
  author: AuthorDtoSchema,
  attachments: z.array(AttachmentDtoSchema),
  likeCount: z.int(),
  isOwner: z.boolean(),
  isLiked: z.boolean(),
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const CommentDtoSchema = z.object({
  id: z.int(),
  content: CommentContentSchema,
  author: AuthorDtoSchema,
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const PostWithCommentsSchema = PostDtoSchema.extend({
  comments: z.array(CommentDtoSchema),
});
