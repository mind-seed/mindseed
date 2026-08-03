import { z } from "zod";
import { PostCategory } from "./entities/post.entity";
import { DeletionType } from "src/comment/entities/post-comment.entity";
import type {
  DeletionTypeSchema,
  PostCategorySchema,
} from "@mindseed/api-types";

type ApiPostCategory = z.output<typeof PostCategorySchema>;
type ApiDeletionType = z.output<typeof DeletionTypeSchema>;

export const apiToEntityCategory: Record<ApiPostCategory, PostCategory> = {
  concern: PostCategory.CONCERN,
  diary: PostCategory.DIARY,
  inquiry: PostCategory.INQUIRY,
  other: PostCategory.OTHER,
};

export const entityToApiDeletionType: Record<DeletionType, ApiDeletionType> = {
  [DeletionType.AUTHOR]: "author",
  [DeletionType.ADMIN]: "admin",
};

export const entityToApiCategory: Record<PostCategory, ApiPostCategory> = {
  [PostCategory.CONCERN]: "concern",
  [PostCategory.DIARY]: "diary",
  [PostCategory.INQUIRY]: "inquiry",
  [PostCategory.OTHER]: "other",
};
