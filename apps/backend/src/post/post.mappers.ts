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
  dummy1: PostCategory.DUMMY1,
  dummy2: PostCategory.DUMMY2,
  dummy3: PostCategory.DUMMY3,
};

export const entityToApiDeletionType: Record<DeletionType, ApiDeletionType> = {
  [DeletionType.AUTHOR]: "author",
  [DeletionType.ADMIN]: "admin",
};

export const entityToApiCategory: Record<PostCategory, ApiPostCategory> = {
  [PostCategory.DUMMY1]: "dummy1",
  [PostCategory.DUMMY2]: "dummy2",
  [PostCategory.DUMMY3]: "dummy3",
};
