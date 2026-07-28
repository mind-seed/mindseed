import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { FilterButton } from "../../components/community/FilterButton";
import { FloatingButton } from "../../components/community/FloatingButton";
import { Banner } from "../../components/community/Banner";
import { BottomSheet } from "../../components/community/BottomSheet";
import { Post } from "../../components/community/Post";
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { PostWithCommentsSchema } from "../../type/index";
import type { CommunityPost, PostCategory } from "../../type/index";

type CommunityCategory = "all" | PostCategory | "other";

const COMMUNITY_CATEGORIES: ReadonlyArray<{
  value: CommunityCategory;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "dummy1", label: "고민상담" },
  { value: "dummy2", label: "일상" },
  { value: "dummy3", label: "문의" },
  { value: "other", label: "기타" },
];

const COMMUNITY_SORT_OPTIONS = ["최신순", "인기순", "추천순"] as const;
type CommunitySort = (typeof COMMUNITY_SORT_OPTIONS)[number];

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    content: "요즘 마음이 복잡한데 어떻게 정리하면 좋을까요?",
    category: "dummy1",
    author: { nickname: "마음지기" },
    attachments: [],
    likeCount: 12,
    isOwner: true,
    isLiked: false,
    createdAt: "2026-07-28T09:00:00.000Z",
    updatedAt: "2026-07-28T09:00:00.000Z",
    comments: [
      {
        type: "active",
        id: 1,
        content: "작성자 댓글입니다.",
        author: { nickname: "마음지기" },
        createdAt: "2026-07-28T09:10:00.000Z",
        updatedAt: "2026-07-28T09:10:00.000Z",
      },
      {
        type: "active",
        id: 2,
        content: "천천히 하나씩 적어보는 건 어떨까요?",
        author: { nickname: "새싹이" },
        createdAt: "2026-07-28T09:20:00.000Z",
        updatedAt: "2026-07-28T09:20:00.000Z",
      },
    ],
  },
  {
    id: 2,
    content: "오늘은 산책하면서 기분 전환을 했어요.",
    category: "dummy2",
    author: { nickname: "초록이" },
    attachments: [],
    likeCount: 8,
    isOwner: false,
    isLiked: true,
    createdAt: "2026-07-27T10:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    comments: [],
  },
  {
    id: 3,
    content: "자가진단 결과는 어디에서 다시 확인할 수 있나요?",
    category: "dummy3",
    author: { nickname: "푸른콩" },
    attachments: [],
    likeCount: 5,
    isOwner: false,
    isLiked: false,
    createdAt: "2026-07-26T11:00:00.000Z",
    updatedAt: "2026-07-26T11:00:00.000Z",
    comments: [],
  },
  {
    id: 4,
    content: "잠들기 전에 어떤 생각을 하면 마음이 편해질까요?",
    category: "dummy1",
    author: { nickname: "나무늘보" },
    attachments: [],
    likeCount: 18,
    isOwner: false,
    isLiked: false,
    createdAt: "2026-07-25T12:00:00.000Z",
    updatedAt: "2026-07-25T12:00:00.000Z",
    comments: [],
  },
  {
    id: 5,
    content: "작은 화분에 새싹이 올라왔어요!",
    category: "dummy2",
    author: { nickname: "햇살이" },
    attachments: [],
    likeCount: 21,
    isOwner: false,
    isLiked: true,
    createdAt: "2026-07-24T13:00:00.000Z",
    updatedAt: "2026-07-24T13:00:00.000Z",
    comments: [],
  },
].map((post) => PostWithCommentsSchema.parse(post));

const getCommunityPostPath = (postId: string | number) =>
  `/community/${postId}`;

const isCommunityCategory = (
  value: string | null,
): value is CommunityCategory =>
  COMMUNITY_CATEGORIES.some((category) => category.value === value);

export const CommunityMainPage = () => {
  const navigate = useNavigate();
  const posts = COMMUNITY_POSTS;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [activeSort, setActiveSort] = useState<CommunitySort>("최신순");
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
