import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import type { z } from "zod";
import { PostCategorySchema } from "@mindseed/api-types";
import { Category } from "../../components/Category";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { FilterButton } from "../../components/Community/FilterButton";
import { Post } from "../../components/Community/Post";
import { TopBar } from "../../components/TopBar";
import { DestructiveConfirmModal } from "../../components/DestructiveConfirmModal";
import { POST_CATEGORIES } from "../../constants/postCategory";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { getPosts, deletePost } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";

type PostCategory = z.output<typeof PostCategorySchema>;
type MyPostsCategory = "ALL" | PostCategory;

const MY_POSTS_CATEGORIES: ReadonlyArray<{
  value: MyPostsCategory;
  label: string;
}> = [{ value: "ALL", label: "전체" }, ...POST_CATEGORIES];

const SORT_OPTIONS = ["최신순", "인기순", "추천순"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const isMyPostsCategory = (value: string | null): value is MyPostsCategory =>
  MY_POSTS_CATEGORIES.some((category) => category.value === value);

export const MyPosts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState<SortOption>("최신순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const categoryParam = searchParams.get("category");
  const activeCategory = isMyPostsCategory(categoryParam)
    ? categoryParam
    : "ALL";

  const postsQuery = useInfiniteQuery({
    queryKey: ["posts", { onlyMine: true, category: activeCategory }],
    queryFn: ({ signal, pageParam }) =>
      callAuthenticated(
        (token) =>
          getPosts(
            token,
            {
              cursor: pageParam,
              limit: 20,
              orderBy: "createdAt",
              orderDirection: "desc",
              category: activeCategory === "ALL" ? undefined : activeCategory,
              onlyMine: true,
            },
            { signal },
          ),
        navigate,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const sortedPosts = [...posts].sort((first, second) => {
    if (activeSort === "인기순") {
      return second.likeCount - first.likeCount;
    }
    return 0;
  });

  const handleCategoryChange = (category: MyPostsCategory) => {
    setSearchParams(category === "ALL" ? {} : { category });
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deletePostsMutation = useMutation({
    mutationFn: (postIds: number[]) =>
      callAuthenticated(
        (token) => Promise.all(postIds.map((id) => deletePost(token, id))),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      setSelectedPostIds([]);
      setIsEditing(false);
      setIsDeleteOpen(false);
    },
  });

  const handleRightClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (selectedPostIds.length > 0) {
      setIsDeleteOpen(true);
    } else {
      setSelectedPostIds([]);
      setIsEditing(false);
    }
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
          onRightClick={handleRightClick}
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
        ) : postsQuery.isLoading ? null : (
          <Empty>작성한 글이 없습니다.</Empty>
        )}
        {postsQuery.hasNextPage && (
          <LoadMoreButton
            type="button"
            onClick={() => postsQuery.fetchNextPage()}
            disabled={postsQuery.isFetchingNextPage}
          >
            더 보기
          </LoadMoreButton>
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

      <DestructiveConfirmModal
        isOpen={isDeleteOpen}
        title="선택한 글을 삭제하시겠습니까?"
        description={`한 번 삭제한 글은 다시\n복구할 수 없습니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        isPending={deletePostsMutation.isPending}
        onConfirm={() => deletePostsMutation.mutate(selectedPostIds)}
        onCancel={() => setIsDeleteOpen(false)}
      />
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

const LoadMoreButton = styled.button`
  margin: 1rem auto;
  padding: 0.5rem 1.5rem;
  border: 1px solid ${COLORS.gray.gray300};
  border-radius: 8px;
  background: none;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
