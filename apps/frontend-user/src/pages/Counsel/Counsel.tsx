import { useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { CounselStatus } from "../../components/Counsel/CounselStatus";
import { TopBar } from "../../components/TopBar";
import potImage from "../../assets/pot.png";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { ApiError, getCounsels } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { PaginationErrorCode } from "@mindseed/api-types";

function getCounselListError(error: unknown): string {
  if (
    error instanceof ApiError &&
    error.errorCode === PaginationErrorCode.INVALID_CURSOR
  ) {
    return "잘못된 페이지 정보입니다. 새로고침 후 다시 시도해주세요.";
  }
  return "목록을 불러오지 못했습니다.";
}

export const Counsel = () => {
  const navigate = useNavigate();

  const counselsQuery = useInfiniteQuery({
    queryKey: ["counsels"],
    queryFn: ({ signal, pageParam }) =>
      callAuthenticated(
        (token) =>
          getCounsels(
            token,
            {
              cursor: pageParam,
              limit: 20,
              orderBy: "createdAt",
              orderDirection: "desc",
            },
            { signal },
          ),
        navigate,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const counsels =
    counselsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Page>
      <TopBar onBackClick={() => navigate(-1)} />
      <Header>
        <Heading>
          최근 힘든 일이 있으신가요?
          <br />
          편안하게 말씀해 주세요.
        </Heading>
        <Description>
          작성해주신 모든 내용은 비밀이 철저히 유지됩니다.
        </Description>
      </Header>

      <Content>
        {counselsQuery.isError ? (
          <Empty>
            <EmptyText>{getCounselListError(counselsQuery.error)}</EmptyText>
          </Empty>
        ) : counsels.length > 0 ? (
          <PostList>
            {counsels.map((counsel) => (
              <CounselStatus
                key={counsel.id}
                title={counsel.title}
                responded={counsel.responded}
                onClick={() => navigate(`/counsel/${counsel.id}`)}
              />
            ))}
            {counselsQuery.hasNextPage && (
              <LoadMoreButton
                onClick={() => void counselsQuery.fetchNextPage()}
                disabled={counselsQuery.isFetchingNextPage}
              >
                {counselsQuery.isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </LoadMoreButton>
            )}
          </PostList>
        ) : (
          <Empty>
            <EmptyText>아직 아무런 글도 작성되지 않았어요!</EmptyText>
            <EmptyImage src={potImage} aria-label="빈 화분 이미지 영역" />
          </Empty>
        )}
      </Content>

      <BottomArea>
        <Button
          variant="primary"
          size="medium"
          label="글 작성하러 가기"
          onClick={() => navigate("/counsel/write")}
        />
      </BottomArea>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  min-height: 100dvh;
  padding-bottom: 5rem;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 1rem 1.25rem;
  text-align: center;
`;

const Heading = styled.h1`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const Description = styled.p`
  margin-top: 0.5rem;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const Content = styled.div`
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Empty = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const EmptyText = styled.p`
  position: absolute;
  top: 35%;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
`;

const EmptyImage = styled.img`
  position: absolute;
  bottom: 1.5rem;
  width: 12rem;
  height: 12rem;
`;

const PostList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.625rem 1.25rem;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;

const BottomArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1.25rem;
  background: ${COLORS.gray.gray0};
`;
