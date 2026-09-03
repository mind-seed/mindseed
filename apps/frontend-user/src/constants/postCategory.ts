import type { z } from "zod";
import { PostCategorySchema } from "@mindseed/api-types";

type PostCategory = z.output<typeof PostCategorySchema>;

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  concern: "고민상담",
  diary: "일상",
  inquiry: "문의",
  other: "기타",
};

export const POST_CATEGORIES: ReadonlyArray<{
  value: PostCategory;
  label: string;
}> = (Object.keys(POST_CATEGORY_LABELS) as PostCategory[]).map((value) => ({
  value,
  label: POST_CATEGORY_LABELS[value],
}));

export function getPostCategoryLabel(category: PostCategory): string {
  return POST_CATEGORY_LABELS[category];
}
