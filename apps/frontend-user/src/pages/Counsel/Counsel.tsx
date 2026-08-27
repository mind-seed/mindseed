import { useNavigate } from "react-router";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { CounselStatus } from "../../components/Counsel/CounselStatus";
import { TopBar } from "../../components/TopBar";
import potImage from "../../assets/pot-img.png";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselSummaryDtoSchema } from "@mindseed/api-types";

type CounselSummaryDto = z.infer<typeof CounselSummaryDtoSchema>;

const COUNSELS: CounselSummaryDto[] = [].map((counsel) =>
  CounselSummaryDtoSchema.parse(counsel),
);

export const Counsel = () => {
  const navigate = useNavigate();

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
        {COUNSELS.length > 0 ? (
          <PostList>
            {COUNSELS.map((counsel) => (
              <CounselStatus
                key={counsel.id}
                title={counsel.title}
                responded={counsel.responded}
                onClick={() => navigate(`/counsel/${counsel.id}`)}
              />
            ))}
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

const BottomArea = styled.div`
  flex-shrink: 0;
  padding: 0.75rem 1.25rem;
`;
