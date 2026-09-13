import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { styled } from "styled-components";
import type { z } from "zod";
import { ResourceCategorySchema } from "@mindseed/api-types";
import { Category } from "../../components/Category";
import { ArticleCard } from "../../components/Contents/ArticleCard";
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { RESOURCE_CATEGORIES } from "../../constants/resourceCategory";
import { useInfiniteQuery } from "@tanstack/react-query";
import { callAuthenticated } from "../../api/callAuthenticated";
import { getContents } from "../../api/api";
import useInView from "../../hooks/useInView";

type ResourceCategory = z.infer<typeof ResourceCategorySchema>;

type ContentCategory = "ALL" | ResourceCategory;

const CONTENT_CATEGORIES: ReadonlyArray<{
  value: ContentCategory;
  label: string;
}> = [{ value: "ALL", label: "전체" }, ...RESOURCE_CATEGORIES];

const isContentCategory = (value: string | null): value is ContentCategory =>
  CONTENT_CATEGORIES.some((category) => category.value === value);

export const Contents = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const categoryParam = searchParams.get("category");
  const activeCategory = isContentCategory(categoryParam)
    ? categoryParam
    : "ALL";

  const { ref, isInView } = useInView();
  
  const contentsQuery = useInfiniteQuery({
    queryKey: ["contents", { category: activeCategory }],
    queryFn: ({ signal, pageParam }) =>
      callAuthenticated(
        (token) =>
          getContents(
            token,
            {
              cursor: pageParam,
              limit: 20,
              orderBy: "createdAt",
              orderDirection: "desc",
              category: activeCategory === "ALL" ? undefined : activeCategory,
            },
            { signal },
          ),
        navigate,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setSearchText("");
    setSearchKeyword("");
    console.log(contentsQuery.data);
  }, [activeCategory]);

  const articles =
    contentsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const filteredArticles = articles.filter((article) => {
    const matchedKeyword =
      !normalizedKeyword ||
      article.title.toLowerCase().includes(normalizedKeyword);

    return matchedKeyword;
  });

  const isFetchingRef = useRef(false);
  const consumedRef = useRef(false);
  const prevContextRef = useRef("");

  const searchContext = `${normalizedKeyword}|${activeCategory}`;

  useEffect(() => {
    if (prevContextRef.current !== searchContext) {
      prevContextRef.current = searchContext;
      consumedRef.current = false;
    }

    if (!isInView) {
      consumedRef.current = false;
      return;
    }

    if (
      consumedRef.current ||
      contentsQuery.isFetchingNextPage ||
      isFetchingRef.current
    ) {
      return;
    }

    consumedRef.current = true;
    isFetchingRef.current = true;
    void contentsQuery.fetchNextPage().finally(() => {
      isFetchingRef.current = false;
    });
  }, [
    isInView,
    searchContext,
    contentsQuery.hasNextPage,
    contentsQuery.isFetchingNextPage,
    filteredArticles.length,
  ]);

  const handleCategoryChange = (category: ContentCategory) => {
    setSearchParams(category === "ALL" ? {} : { category });
  };

  return (
    <Page>
      <Header>
        <SearchBar
          name="contents-search"
          value={searchText}
          placeholder="검색어를 입력해주세요."
          onChange={(event) => setSearchText(event.target.value)}
          onSearch={setSearchKeyword}
        />
      </Header>

      <CategoryBar>
        {CONTENT_CATEGORIES.map((category) => (
          <Category
            key={category.value}
            $variant={activeCategory === category.value ? "active" : "inactive"}
            $label={category.label}
            onClick={() => handleCategoryChange(category.value)}
          />
        ))}
      </CategoryBar>

      <ArticleList>
        {contentsQuery.isError ? (
          <Empty>콘텐츠를 불러오지 못했습니다.</Empty>
        ) : filteredArticles.length > 0 ? (
          <>
            {filteredArticles.map((article) => (
              <div key={article.id}>
                <ArticleCard
                  title={article.title}
                  category={article.category}
                  url={article.url}
                  description={article.title}
                />
              </div>
            ))}
            <div ref={ref} aria-hidden="true" />
          </>
        ) : contentsQuery.isLoading ? null : (
          <Empty>등록된 콘텐츠가 없습니다.</Empty>
        )}
      </ArticleList>
    </Page>
  );
};

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.25rem;
`;

const Header = styled.header`
  margin-bottom: 0.75rem;
`;

const CategoryBar = styled.nav`
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ArticleList = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
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
