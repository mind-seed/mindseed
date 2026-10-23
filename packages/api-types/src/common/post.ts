import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { AuthorDtoSchema } from "./author";
import { CommentDtoSchema } from "./comment";
import { ReportDtoSchema } from "./report";

export const PostContentSchema = z.string().min(1).max(200);

export const PostCategorySchema = z.enum([
  "concern",
  "diary",
  "inquiry",
  "other",
]);

export const AttachmentDtoSchema = z.object({
  id: z.int(),
  url: z.url(),
});

export const PostAttachmentIdsSchema = z.array(z.int()).max(3);

export const PostDtoSchema = z.object({
  id: z.int(),
  content: PostContentSchema,
  category: PostCategorySchema,
  author: AuthorDtoSchema,
  attachments: z.array(AttachmentDtoSchema).max(3),
  likeCount: z.int(),
  isOwner: z.boolean(),
  isLiked: z.boolean(),
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const AdminPostDtoSchema = z.object({
  id: z.int(),
  content: PostContentSchema,
  category: PostCategorySchema,
  author: AuthorDtoSchema,
  likeCount: z.int(),
  reportCount: z.int(),
  commentCount: z.int(),
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});

export const PostWithCommentsSchema = PostDtoSchema.extend({
  comments: z.array(CommentDtoSchema),
});

export const AdminPostWithCommentsSchema = z.object({
  id: z.int(),
  content: PostContentSchema,
  category: PostCategorySchema,
  author: AuthorDtoSchema,
  likeCount: z.int(),
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
  attachments: z.array(AttachmentDtoSchema).max(3),
  comments: z.array(CommentDtoSchema),
  reports: z.array(ReportDtoSchema),
});
