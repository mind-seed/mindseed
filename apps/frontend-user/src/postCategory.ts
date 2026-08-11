import type { PostCategory } from "./type/index";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  CONCERN: "고민상담",
  DIARY: "일상",
  INQUIRY: "문의",
  OTHER: "기타",
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
