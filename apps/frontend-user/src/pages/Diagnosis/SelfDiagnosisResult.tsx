import { Navigate, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DiagnosisErrorCode,
  type GetDiagnosisSuccessResponseDto,
} from "@mindseed/api-types";
import styled from "styled-components";
import { ApiError, getCurrentUser, getDiagnosis } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { CHARACTERS } from "../../constants/character";
import { Button } from "../../components/Button";
import {
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_CATEGORY_LABELS,
  getQuestionsByCategory,
} from "../../constants/diagnosisQuestion";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

const STABLE_RATIO_THRESHOLD = 0.5;

const calculateResults = (diagnosis: GetDiagnosisSuccessResponseDto["data"]) =>
  DIAGNOSIS_CATEGORIES.map((category) => {
    const score = diagnosis[`${category}Score`];
    const { maxScore } = getQuestionsByCategory(category);
    const ratio = maxScore > 0 ? Math.min(1, Math.max(0, score / maxScore)) : 0;

    return {
      category,
      label: DIAGNOSIS_CATEGORY_LABELS[category],
      ratio,
      percentage: Math.round(ratio * 100),
    };
  });

export const SelfDiagnosisResult = () => {
  const navigate = useNavigate();
  const diagnosisQuery = useQuery({
    queryKey: ["diagnosis"],
    queryFn: ({ signal }) =>
      callAuthenticated((token) => getDiagnosis(token, { signal }), navigate),
  });
  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: ({ signal }) =>
      callAuthenticated((token) => getCurrentUser(token, { signal }), navigate),
  });
  const user = userQuery.data;

  if (diagnosisQuery.isPending) {
    return (
      <Page>
        <StatusContent role="status">
          <Title>자가진단 결과를 불러오는 중이에요.</Title>
          <Description>잠시만 기다려주세요.</Description>
        </StatusContent>
      </Page>
    );
  }
  if (
    diagnosisQuery.error instanceof ApiError &&
    diagnosisQuery.error.errorCode === DiagnosisErrorCode.DIAGNOSIS_NOT_FOUND
  ) {
    return <Navigate to="/diagnosis" replace />;
  }
  if (diagnosisQuery.isError) {
    return (
      <Page>
        <StatusContent role="alert">
          <Title>자가진단 결과를 불러오지 못했어요.</Title>
          <Description>잠시 후 다시 시도해주세요.</Description>
        </StatusContent>
        <Button
          variant="primary"
          size="medium"
          label="다시 시도"
          disabled={diagnosisQuery.isFetching}
          onClick={() => void diagnosisQuery.refetch()}
        />
      </Page>
    );
  }
  const results = calculateResults(diagnosisQuery.data);
  const maxRatio = Math.max(...results.map((result) => result.ratio));
  const primaryLabels = results
    .filter((result) => result.ratio === maxRatio)
    .map((result) => result.label)
    .join(", ");
  const character = userQuery.isError
    ? CHARACTERS[0]
    : (CHARACTERS[user?.profile?.characterIndex ?? 0] ?? CHARACTERS[0]);

  return (
    <Page>
      <Header>
        <Title>
          자가진단 결과,
          <br />
          {maxRatio <= STABLE_RATIO_THRESHOLD ? (
            "사용자님의 마음은 안정적이에요."
          ) : (
            <>
              사용자님의 결과는 <TitleHighlight>{primaryLabels}</TitleHighlight>{" "}
              입니다.
            </>
          )}
        </Title>
        <Description>완료 버튼을 누르고, 함께 여정을 시작해보세요.</Description>
      </Header>

      <ResultList>
        {results.map((result) => (
          <ResultItem key={result.category}>
            <ResultHeading>
              <ResultLabel>{result.label}</ResultLabel>
              <ResultPercentage>
                <PercentageValue>{result.percentage}</PercentageValue>%
              </ResultPercentage>
            </ResultHeading>
            <ProgressRow>
              <RangeLabel>낮음</RangeLabel>
              <ProgressTrack>
                <ProgressBar $percentage={result.percentage} />
              </ProgressTrack>
              <RangeLabel>높음</RangeLabel>
            </ProgressRow>
          </ResultItem>
        ))}
      </ResultList>

      <CharacterArea>
        {userQuery.isPending ? (
          <Description role="status">캐릭터를 불러오는 중...</Description>
        ) : (
          <CharacterImage src={character.images.counsel} alt="" />
        )}
      </CharacterArea>

      <Actions>
        <Button
          variant="primary"
          size="medium"
          label="완료"
          onClick={() => navigate("/", { replace: true })}
        />
      </Actions>
    </Page>
  );
};

const Page = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.875rem 1.25rem 0.75rem;
  background: ${COLORS.gray.gray0};
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  text-align: center;
  padding: 0.625rem 0;
`;

const Title = styled.h1`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const TitleHighlight = styled.span`
  color: ${COLORS.main.main};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const StatusContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
  padding: 0.625rem 0;
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultHeading = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.375rem;
`;

const ResultLabel = styled.h2`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.md2};
`;

const ResultPercentage = styled.span`
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
`;

const PercentageValue = styled.strong`
  color: ${COLORS.main["main+"]};
  font: inherit;
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const RangeLabel = styled.span`
  flex: none;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.ti};
`;

const ProgressTrack = styled.div`
  height: 0.75rem;
  flex: 1;
  overflow: hidden;
  border-radius: 99px;
  background: ${COLORS.gray.gray200};
`;

const ProgressBar = styled.div<{ $percentage: number }>`
  width: ${({ $percentage }) => `${Math.min(Math.max($percentage, 0), 100)}%`};
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(to right, #abd138 0%, #54b54d 100%);
`;

const CharacterArea = styled.div`
  min-height: 12.9375rem;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
`;

const CharacterImage = styled.img`
  width: auto;
  height: 12.9375rem;
  object-fit: contain;
`;

const Actions = styled.div`
  margin-top: 2rem;
`;
