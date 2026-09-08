import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { styled } from "styled-components";
import type { z } from "zod";
import { PostCategorySchema, PostDtoSchema } from "@mindseed/api-types";
import { Category } from "../../components/Category";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { FilterButton } from "../../components/Community/FilterButton";
import { FloatingButton } from "../../components/Community/FloatingButton";
import { Post } from "../../components/Community/Post";
import { TopBar } from "../../components/TopBar";
import { POST_CATEGORIES } from "../../constants/postCategory";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type PostCategory = z.output<typeof PostCategorySchema>;
type MyPostsCategory = "ALL" | PostCategory;

const MY_POSTS_CATEGORIES: ReadonlyArray<{
  value: MyPostsCategory;
  label: string;
}> = [{ value: "ALL", label: "전체" }, ...POST_CATEGORIES];

const SORT_OPTIONS = ["최신순", "인기순", "추천순"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const MY_POSTS = PostDtoSchema.array().decode([
  {
    id: 1,
    author: { nickname: "춤추는 아나콘다" },
    content:
      "제 몸이 멈추질 않아요!! 춤을 더이상 추고싶지않은데 어떻게 멈춰야 하나요?\n신나는 소리만 들리면 몸이 춤을 추는것만 같아요.\n주위 동물들이 자꾸 놀려요.제 몸이 멈추질 않아요!! 춤을 더이상 추고싶지않은데 어떻게 멈춰야 하나요?\n신나는 소리만 들리면 몸이 춤을 추는것만 같아요.\n주위 동물들이 자꾸 놀려요안녕안녕안녕안녕안녕안녕안녕안녕안녕안녕안녕안녕안",
    category: "concern",
    attachments: [
      {
        id: 1,
        url: "https://example.com/images/sample.jpg",
      },
    ],
    likeCount: 24,
    isOwner: true,
    isLiked: true,
    createdAt: "2026-09-08T08:58:00.000Z",
    updatedAt: "2026-09-08T08:58:00.000Z",
  },
  {
    id: 2,
    author: { nickname: "바람을 접는 종이" },
    content: "오늘은 날씨가 참 좋네~",
    category: "diary",
    attachments: [],
    likeCount: 18,
    isOwner: true,
    isLiked: false,
    createdAt: "2026-09-08T08:54:00.000Z",
    updatedAt: "2026-09-08T08:54:00.000Z",
  },
  {
    id: 3,
    author: { nickname: "책먹는 여우" },
    content: "오늘 먹은 책들",
    category: "diary",
    attachments: [],
    likeCount: 11,
    isOwner: true,
    isLiked: false,
    createdAt: "2026-09-08T08:44:00.000Z",
    updatedAt: "2026-09-08T08:44:00.000Z",
  },
  {
    id: 4,
    author: { nickname: "소심한 흰색 비둘기" },
    content: "저...그 여기는 익명이 확실하게 보장되나요..?",
    category: "inquiry",
    attachments: [],
    likeCount: 7,
    isOwner: true,
    isLiked: false,
    createdAt: "2026-09-08T08:00:00.000Z",
    updatedAt: "2026-09-08T08:00:00.000Z",
  },
  {
    id: 5,
    author: { nickname: "유령같은 투명" },
    content: "투명한 내 몸 멋지지!",
    category: "other",
    attachments: [],
    likeCount: 32,
    isOwner: true,
    isLiked: true,
    createdAt: "2026-09-06T09:00:00.000Z",
    updatedAt: "2026-09-06T09:00:00.000Z",
  },
]);

const isMyPostsCategory = (value: string | null): value is MyPostsCategory =>
  MY_POSTS_CATEGORIES.some((category) => category.value === value);

export const MyPosts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState<SortOption>("최신순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const categoryParam = searchParams.get("category");
  const activeCategory = isMyPostsCategory(categoryParam)
    ? categoryParam
    : "ALL";

  const posts = MY_POSTS.filter(
    (post) => activeCategory === "ALL" || post.category === activeCategory,
  );

  const sortedPosts = [...posts].sort((first, second) => {
    if (activeSort === "최신순") {
      return (
        second.createdAt.epochMilliseconds - first.createdAt.epochMilliseconds
      );
    }

    if (activeSort === "인기순") {
      return second.likeCount - first.likeCount;
    }

    return 0;
  });

  const handleCategoryChange = (category: MyPostsCategory) => {
    setSearchParams(category === "ALL" ? {} : { category });
  };

  const handleEditToggle = () => {
    setIsEditing((editing) => !editing);
  };

  const handleSelectionClick = (postId: number) => {
    setSelectedPostIds((current) => {
      return current.includes(postId)
        ? current.filter((item) => item !== postId)
        : [...current, postId];
    });
  };

  return (
    <Page>
      <Header>
        <TopBar
          title={
            isEditing ? `${selectedPostIds.length}개 선택됨` : "내 글 보기"
          }
          rightType="text"
          rightText={
            isEditing ? (selectedPostIds.length ? "삭제" : "취소") : "편집"
          }
          rightTone={
            isEditing
              ? selectedPostIds.length
                ? "danger"
                : "muted"
              : "primary"
          }
          onBackClick={() => navigate("/mypage")}
          onRightClick={handleEditToggle}
        />
      </Header>

      <FilterBar>
        <CategoryTab>
          {MY_POSTS_CATEGORIES.map((category) => (
            <Category
              key={category.value}
              $variant={
                activeCategory === category.value ? "active" : "inactive"
              }
              $label={category.label}
              onClick={() => handleCategoryChange(category.value)}
            />
          ))}
        </CategoryTab>
        <FilterButton onClick={() => setIsSortOpen(true)} />
      </FilterBar>

      <PostList>
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <Post
              key={post.id}
              author={post.author}
              category={post.category}
              content={post.content}
              attachments={post.attachments}
              createdAt={post.createdAt}
              isLiked={post.isLiked}
              selectionMode={isEditing}
              selected={selectedPostIds.includes(post.id)}
              onClick={() => navigate(`/community/${post.id}`)}
              onLikeClick={() => undefined}
              onSelectionClick={() => handleSelectionClick(post.id)}
            />
          ))
        ) : (
          <Empty>작성한 글이 없습니다.</Empty>
        )}
      </PostList>

      {isSortOpen && (
        <BottomSheet
          variant="sort"
          menuList={Array.from(SORT_OPTIONS)}
          activeMenu={activeSort}
          isClose={false}
          onClick={(menu) => {
            setActiveSort(menu);
            setIsSortOpen(false);
          }}
          onClose={() => setIsSortOpen(false)}
        />
      )}
    </Page>
  );
};

const Page = styled.main`
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: ${COLORS.gray.gray0};
`;

const Header = styled.header`
  min-height: 3.5rem;

  > div {
    min-height: 3.5rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  overflow-x: auto;
`;

const CategoryTab = styled.nav`
  display: flex;
`;

const PostList = styled.div`
  position: relative;
  min-height: 15rem;
  display: flex;
  flex-direction: column;
`;

const Empty = styled.p`
  position: absolute;
  top: 8rem;
  left: 50%;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
  transform: translateX(-50%);
  text-align: center;
`;
