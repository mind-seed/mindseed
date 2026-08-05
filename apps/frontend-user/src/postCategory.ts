import type { PostCategory } from "./type/index";

export const POST_CATEGORIES: ReadonlyArray<{
  value: PostCategory;
  label: string;
}> = [
  { value: "CONCERN", label: "고민상담" },
  { value: "DIARY", label: "일상" },
  { value: "INQUIRY", label: "문의" },
  { value: "OTHER", label: "기타" },
];

export const POST_CATEGORY_LABELS = Object.fromEntries(
  POST_CATEGORIES.map(({ value, label }) => [value, label]),
) as Record<PostCategory, string>;

export function getPostCategoryLabel(category: PostCategory): string {
  return POST_CATEGORY_LABELS[category];
}
