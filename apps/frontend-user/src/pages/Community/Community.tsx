import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import {
  COMMUNITY_CATEGORIES,
  type CommunityCategory,
  getCommunityPostPath,
} from "./communityModel";
import type { CommunityPost } from "../../type/index";

const COMMUNITY_SORT_OPTIONS = ["추천순", "최신순", "인기순"] as const;
type CommunitySort = (typeof COMMUNITY_SORT_OPTIONS)[number];

const isCommunityCategory = (
  value: string | null,
): value is CommunityCategory =>
  COMMUNITY_CATEGORIES.some((category) => category.value === value);

export const CommunityMainPage = () => {
  const navigate = useNavigate();
  const posts: CommunityPost[] = [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [activeSort, setActiveSort] = useState<CommunitySort>("추천순");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const categoryParam = searchParams.get("category");
  const activeCategory = isCommunityCategory(categoryParam)
    ? categoryParam
    : "all";
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" || post.category === activeCategory;
    const matchesKeyword =
      !normalizedKeyword ||
      post.content.toLowerCase().includes(normalizedKeyword) ||
      post.author.nickname.toLowerCase().includes(normalizedKeyword);

    return matchesCategory && matchesKeyword;
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
    setSearchParams(category === "all" ? {} : { category });
  };

  const handleLikeClick = (post: CommunityPost) => {
    setLikedPosts((current) => ({
      ...current,
      [post.id]: !(current[post.id] ?? post.isLiked),
    }));
  };

  return (
    <Page>
      <Header>
        <SearchBar
          name="community-search"
          value={searchText}
          placeholder="검색어를 입력하세요"
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

      <PostContainer>
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <Post
              key={post.id}
              author={post.author}
              category={post.category}
              content={post.content}
              attachments={post.attachments}
              createdAt={post.createdAt}
              isLiked={likedPosts[post.id] ?? post.isLiked}
              onClick={() => navigate(getCommunityPostPath(post.id))}
              onLikeClick={() => handleLikeClick(post)}
            />
          ))
        ) : (
          <Empty>
            아직 등록된 글이 없어요. <br />첫 번째 이야기를 들려주실래요?
          </Empty>
        )}
      </PostContainer>

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

export const Community = CommunityMainPage;

const Page = styled.main`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 2.1875rem 0 1.875rem;
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

const PostContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Empty = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
  transform: translate(-50%, -50%);
  text-align: center;
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  right: 1.125rem;
  bottom: 4.75rem;
  z-index: 9;
`;
