export type CommunityCategory = "all" | "dummy1" | "dummy2" | "dummy3";

export const COMMUNITY_CATEGORIES: ReadonlyArray<{
  value: CommunityCategory;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "dummy1", label: "마음챙김" },
  { value: "dummy2", label: "고민상담" },
  { value: "dummy3", label: "일상" },
];

export const getCategoryLabel = (category: CommunityCategory) =>
  COMMUNITY_CATEGORIES.find((item) => item.value === category)?.label ??
  category;

export const getCommunityPostPath = (postId: string | number) =>
  `/community/${postId}`;
