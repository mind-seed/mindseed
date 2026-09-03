import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { FilterButton } from "../../components/Community/FilterButton";
import { FloatingButton } from "../../components/Community/FloatingButton";
import { Banner } from "../../components/Community/Banner";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { Post } from "../../components/Community/Post";
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { PostCategorySchema, PostDtoSchema } from "@mindseed/api-types";
import { getPosts, setPostLike } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { POST_CATEGORIES } from "../../constants/postCategory";

type PostCategory = z.output<typeof PostCategorySchema>;
type PostDto = z.infer<typeof PostDtoSchema>;

type CommunityCategory = "ALL" | PostCategory;

const COMMUNITY_CATEGORIES: ReadonlyArray<{
  value: CommunityCategory;
  label: string;
}> = [{ value: "ALL", label: "전체" }, ...POST_CATEGORIES];

const COMMUNITY_SORT_OPTIONS = ["최신순", "인기순", "추천순"] as const;
type CommunitySort = (typeof COMMUNITY_SORT_OPTIONS)[number];

const getCommunityPostPath = (postId: string | number) =>
  `/community/${postId}`;

const isCommunityCategory = (
  value: string | null,
): value is CommunityCategory =>
  COMMUNITY_CATEGORIES.some((category) => category.value === value);

export const Community = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSort, setActiveSort] = useState<CommunitySort>("최신순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const categoryParam = searchParams.get("category");
  const activeCategory = isCommunityCategory(categoryParam)
    ? categoryParam
    : "ALL";

  const postsQuery = useQuery({
    queryKey: [
      "posts",
      { category: activeCategory === "ALL" ? undefined : activeCategory },
    ],
    queryFn: ({ signal }) =>
      callAuthenticated(
        (token) =>
          getPosts(
            token,
            {
              limit: 50,
              orderBy: "createdAt",
              orderDirection: "desc",
              category: activeCategory === "ALL" ? undefined : activeCategory,
            },
            { signal },
          ),
        navigate,
      ),
  });

  const setPostLikeMutation = useMutation({
    mutationFn: ({ postId, liked }: { postId: number; liked: boolean }) =>
      callAuthenticated(
        (token) => setPostLike(token, postId, { liked }),
        navigate,
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const posts: PostDto[] = postsQuery.data?.items ?? [];

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesKeyword =
      !normalizedKeyword ||
      post.content.toLowerCase().includes(normalizedKeyword) ||
      post.author.nickname.toLowerCase().includes(normalizedKeyword);

    return matchesKeyword;
  });
  const sortedPosts = [...filteredPosts].sort((first, second) => {
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

  const handleCategoryChange = (category: CommunityCategory) => {
    setSearchParams(category === "ALL" ? {} : { category });
  };

  const handleLikeClick = (post: PostDto) => {
    setPostLikeMutation.mutate({ postId: post.id, liked: !post.isLiked });
  };

  return (
    <Page>
      <Header>
        <SearchBar
          name="community-search"
          value={searchText}
          placeholder="검색어를 입력해주세요"
          onChange={(event) => setSearchText(event.target.value)}
          onSearch={setSearchKeyword}
        />
      </Header>

      <CommunityFilterBar>
        <CategoryTab>
          {COMMUNITY_CATEGORIES.map((category) => (
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
      </CommunityFilterBar>

      <BannerContainer>
        <Banner />
      </BannerContainer>

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
              onClick={() => navigate(getCommunityPostPath(post.id))}
              onLikeClick={() => handleLikeClick(post)}
            />
          ))
        ) : (
          <Empty>
            아직 등록된 글이 없어요. <br />첫 번째 이야기를 들려주실래요?
          </Empty>
        )}
      </PostList>

      <FloatingButtonContainer>
        <FloatingButton onClick={() => navigate("/community/write")} />
      </FloatingButtonContainer>

      {isSortOpen && (
        <BottomSheet
          variant="sort"
          menuList={Array.from(COMMUNITY_SORT_OPTIONS)}
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
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  margin-bottom: 0.75rem;
  padding: 0 1.25rem;
`;

const CommunityFilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem;
  overflow-x: auto;
`;

const CategoryTab = styled.nav`
  display: flex;
`;

const BannerContainer = styled.div`
  width: 100%;
  padding: 0.75rem 1.25rem;
`;

const PostList = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Empty = styled.p`
  position: absolute;
  top: 35%;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
  text-align: center;
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  right: 1.125rem;
  bottom: 4.75rem;
  z-index: 9;
`;
