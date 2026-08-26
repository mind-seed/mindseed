import { useState } from "react";
import { useSearchParams } from "react-router";
import { styled } from "styled-components";
import type { z } from "zod";
import { ResourceDtoSchema, ResourceCategorySchema } from "@mindseed/api-types";
import { Category } from "../../components/Category";
import { ArticleCard } from "../../components/Contents/ArticleCard";
import { SearchBar } from "../../components/SearchBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { RESOURCE_CATEGORIES } from "../../constants/resourceCategory";

type ResourceCategory = z.infer<typeof ResourceCategorySchema>;
type ResourceDto = z.infer<typeof ResourceDtoSchema>;

type ContentCategory = "ALL" | ResourceCategory;

type Article = Pick<ResourceDto, "title" | "category" | "url"> & {
  id: number;
  description: string;
  thumbnailUrl?: string;
};

const CONTENT_CATEGORIES: ReadonlyArray<{
  value: ContentCategory;
  label: string;
}> = [{ value: "ALL", label: "전체" }, ...RESOURCE_CATEGORIES];

const isContentCategory = (value: string | null): value is ContentCategory =>
  CONTENT_CATEGORIES.some((category) => category.value === value);

export const Contents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const categoryParam = searchParams.get("category");
  const activeCategory = isContentCategory(categoryParam)
    ? categoryParam
    : "ALL";

  const ARTICLES: Article[] = [
    {
      id: 1,
      title: "우울한 마음을 돌보는 작은 생활 습관",
      category: "depression",
      url: "https://example.com/contents/depression-routine",
      description:
        "무기력한 날에도 부담 없이 시도할 수 있는 일상 회복 습관을 소개합니다. 우울한 마음을 돌보는 작은 생활",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-depression-1/160/160",
    },
    {
      id: 2,
      title: "감정 기록으로 내 마음 이해하기",
      category: "depression",
      url: "https://example.com/contents/emotion-journal",
      description:
        "감정과 생각을 천천히 기록하며 반복되는 마음의 흐름을 살펴봅니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-depression-2/160/160",
    },
    {
      id: 3,
      title: "불안이 밀려올 때 사용하는 호흡법",
      category: "anxiety",
      url: "https://example.com/contents/anxiety-breathing",
      description:
        "갑작스러운 불안을 가라앉히는 데 도움이 되는 간단한 호흡 순서를 알아봅니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-anxiety-1/160/160",
    },
    {
      id: 4,
      title: "걱정과 거리를 두는 연습",
      category: "anxiety",
      url: "https://example.com/contents/managing-worries",
      description:
        "꼬리를 무는 걱정을 객관적으로 바라보고 현재에 집중하는 방법을 소개합니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-anxiety-2/160/160",
    },
    {
      id: 5,
      title: "지친 하루를 정리하는 10분 스트레칭",
      category: "stress",
      url: "https://example.com/contents/stress-stretching",
      description:
        "긴장된 몸을 이완하고 하루 동안 쌓인 스트레스를 덜어내는 동작을 따라 해봅니다.",
    },
    {
      id: 6,
      title: "번아웃 신호를 알아차리는 방법",
      category: "stress",
      url: "https://example.com/contents/burnout-signals",
      description:
        "몸과 마음이 보내는 번아웃의 초기 신호와 필요한 휴식 방법을 확인합니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-stress-2/160/160",
    },
    {
      id: 7,
      title: "건강한 수면 습관 만들기",
      category: "other",
      url: "https://example.com/contents/sleep-habits",
      description:
        "규칙적인 수면 리듬을 만들기 위해 오늘부터 실천할 수 있는 방법을 정리했습니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-other-1/160/160",
    },
    {
      id: 8,
      title: "나에게 맞는 마음 돌봄 루틴 찾기",
      category: "other",
      url: "https://example.com/contents/self-care-routine",
      description:
        "생활 패턴과 감정 상태에 맞는 지속 가능한 마음 돌봄 루틴을 설계해봅니다.",
      thumbnailUrl: "https://picsum.photos/seed/mindseed-other-2/160/160",
    },
  ];

  const filteredArticles = ARTICLES.filter((article) => {
    const matchedCategory =
      activeCategory === "ALL" || article.category === activeCategory;

    const matchedKeyword =
      !normalizedKeyword ||
      article.title.toLowerCase().includes(normalizedKeyword);

    return matchedCategory && matchedKeyword;
  });

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
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))
        ) : (
          <Empty>등록된 콘텐츠가 없습니다.</Empty>
        )}
      </ArticleList>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
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
