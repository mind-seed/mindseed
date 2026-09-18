import { Navigate, useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getCurrentUser } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { getCharcterImages } from "../../constants/character";
import { Button } from "../../components/Button";
import {
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_CATEGORY_LABELS,
} from "../../constants/diagnosisQuestion";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { DiagnosisState } from "./SelfDiagnosis";

const isDiagnosisState = (value: unknown): value is DiagnosisState => {
  if (!value || typeof value !== "object") return false;

  return (
    "depression" in value &&
    typeof (value as { depression?: { score?: unknown } }).depression?.score ===
      "number"
  );
};

const calculateResults = (totals: DiagnosisState) =>
  DIAGNOSIS_CATEGORIES.map((category) => {
    const { score, maxScore } = totals[category];

    return {
      category,
      label: DIAGNOSIS_CATEGORY_LABELS[category],
      ratio: score / maxScore,
      percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
    };
  });

export const SelfDiagnosisResult = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: ({ signal }) =>
      callAuthenticated((token) => getCurrentUser(token, { signal }), navigate),
  });
  const user = userQuery.data;

  if (!isDiagnosisState(state)) return <Navigate to="/diagnosis" replace />;
  const results = calculateResults(state);
  const primaryResult = results.reduce((highest, result) =>
    result.ratio > highest.ratio ? result : highest,
  );

  return (
    <Page>
      <Header>
        <Title>
          자가진단 결과,
          <br />
          사용자님의 결과는{" "}
          <TitleHighlight>{primaryResult.label}</TitleHighlight> 입니다.
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

      <CharacterImage
        src={getCharcterImages(user?.profile?.characterIndex ?? 3).counsel}
        alt=""
      />

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

const Page = styled.main`
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

const CharacterImage = styled.img`
  width: auto;
  height: 12.9375rem;
  margin: auto auto 0;
  object-fit: contain;
`;

const Actions = styled.div`
  margin-top: 2rem;
`;
