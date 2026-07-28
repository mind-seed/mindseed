import type { z } from "zod";
import { AuthorNicknameSchema } from "../../../../packages/api-types/src/common/author";
import {
  ActiveCommentDtoSchema,
  AuthorDeletedCommentDtoSchema,
  DeletedCommentDtoSchema,
} from "../../../../packages/api-types/src/common/comment";
import {
  AttachmentDtoSchema,
  PostCategorySchema,
  PostContentSchema,
  PostDtoSchema,
  PostWithCommentsSchema,
} from "../../../../packages/api-types/src/common/post";

export { AuthorNicknameSchema };
export {
  ActiveCommentDtoSchema,
  AuthorDeletedCommentDtoSchema,
  DeletedCommentDtoSchema,
};
export {
  AttachmentDtoSchema,
  PostCategorySchema,
  PostContentSchema,
  PostDtoSchema,
  PostWithCommentsSchema,
};
export { PasswordSchema } from "../../../../packages/api-types/src/common/user";

export type PictureDto = z.infer<typeof AttachmentDtoSchema>;
export type CommunityPostFixture = z.input<typeof PostWithCommentsSchema>;
export type CommunityPost = z.infer<typeof PostWithCommentsSchema>;
type ActiveCommentDto = z.infer<typeof ActiveCommentDtoSchema>;
type DeletedCommentDto = z.infer<typeof DeletedCommentDtoSchema>;
type AuthorDeletedCommentDto = z.infer<typeof AuthorDeletedCommentDtoSchema>;
export type CommentDto =
  | ActiveCommentDto
  | DeletedCommentDto
  | AuthorDeletedCommentDto;
export type PostDto = z.infer<typeof PostDtoSchema>;
export type PostCategory = z.output<typeof PostCategorySchema>;
export type PostContent = z.output<typeof PostContentSchema>;
