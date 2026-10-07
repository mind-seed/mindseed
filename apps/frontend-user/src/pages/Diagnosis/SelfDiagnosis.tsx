import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateDiagnosisRequestDto } from "@mindseed/api-types";
import styled from "styled-components";
import { createDiagnosis } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { Button } from "../../components/Button";
import { DiagnosisProgress } from "../../components/Diagnoses/DiagnosisProgress";
import { TopBar } from "../../components/TopBar";
import { Option } from "../../components/Option";
import {
  DIAGNOSIS_CATEGORIES,
  getQuestionsByCategory,
  type DiagnosisCategory,
} from "../../constants/diagnosisQuestion";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

export type Answers = Partial<Record<DiagnosisCategory, (number | null)[]>>;

const CURRENT_INDEX_KEY = "diagnosis_current_index";
const ANSWERS_KEY = "diagnosis_answers";

const createDefaultAnswers = (): Answers =>
  Object.fromEntries(
    DIAGNOSIS_CATEGORIES.map((category) => {
      const { totalQuestions } = getQuestionsByCategory(category);
      return [category, Array<number | null>(totalQuestions).fill(null)];
    }),
  ) as Answers;

const getStoredAnswers = (): Answers => {
  const defaultAnswers = createDefaultAnswers();
  const storedAnswers = sessionStorage.getItem(ANSWERS_KEY);
  if (!storedAnswers) return defaultAnswers;

  try {
    const parsedAnswers: unknown = JSON.parse(storedAnswers);
    if (!parsedAnswers || typeof parsedAnswers !== "object") {
      return defaultAnswers;
    }

    return Object.fromEntries(
      DIAGNOSIS_CATEGORIES.map((category) => {
        const { options, totalQuestions } = getQuestionsByCategory(category);
        const categoryAnswers = (parsedAnswers as Partial<Answers>)[category];
        const answers = Array.isArray(categoryAnswers) ? categoryAnswers : [];

        return [
          category,
          Array.from({ length: totalQuestions }, (_, index) => {
            const score = answers[index];
            return typeof score === "number" &&
              options.some((option) => option.score === score)
              ? score
              : defaultAnswers[category]?.[index];
          }),
        ];
      }),
    ) as Answers;
  } catch {
    return defaultAnswers;
  }
};

const getStoredCurrentIndex = () => {
  const currentIndex = Number(sessionStorage.getItem(CURRENT_INDEX_KEY));
  return Number.isInteger(currentIndex) &&
    currentIndex >= 0 &&
    currentIndex < STEPS.length
    ? currentIndex
    : 0;
};

const getCategoryTotals = (
  answers: Answers,
): Record<DiagnosisCategory, number> => {
  return Object.fromEntries(
    DIAGNOSIS_CATEGORIES.map((category) => {
      const score = (answers[category] ?? []).reduce<number>(
        (sum, score) => sum + (score ?? 0),
        0,
      );

      return [category, score];
    }),
  ) as Record<DiagnosisCategory, number>;
};

const STEPS = DIAGNOSIS_CATEGORIES.flatMap((category) => {
  const { questions, options, type } = getQuestionsByCategory(category);
  return questions.map((question) => ({ category, question, options, type }));
});

export const SelfDiagnosis = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const diagnosisMutation = useMutation({
    mutationFn: (input: CreateDiagnosisRequestDto) =>
      callAuthenticated((token) => createDiagnosis(token, input), navigate),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["diagnosis"] });
      sessionStorage.removeItem(CURRENT_INDEX_KEY);
      sessionStorage.removeItem(ANSWERS_KEY);
      navigate("/diagnosis/result");
    },
  });
  const [currentIndex, setCurrentIndex] = useState(getStoredCurrentIndex);
  const [answers, setAnswers] = useState<Answers>(getStoredAnswers);
  const step = STEPS[currentIndex];

  useEffect(() => {
    sessionStorage.setItem(CURRENT_INDEX_KEY, String(currentIndex));
  }, [currentIndex]);

  useEffect(() => {
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  if (
    !step ||
    !step.question.question.trim() ||
    step.options.length === 0
  ) {
    return (
      <Page>
        <TopBar onBackClick={() => navigate("/diagnosis/character")} />
        <ErrorContent role="alert">
          <QuestionTitle>자가진단 문제를 불러오지 못했어요.</QuestionTitle>
          <p>잠시 후 다시 시도해주세요.</p>
        </ErrorContent>
        <Actions>
          <Button
            variant="primary"
            size="medium"
            label="다시 시도"
            onClick={() => window.location.reload()}
          />
        </Actions>
      </Page>
    );
  }

  const { category, question, options, type } = step;
  const selectedAnswer =
    answers[category]?.[Number(question.id)] ??
    (type === "slider"
      ? options[Math.floor(options.length / 2)].score
      : undefined);

  const selectAnswer = (score: number) => {
    if (diagnosisMutation.isPending) return;
    setAnswers((current) => {
      const categoryAnswers = [...(current[category] ?? [])];
      categoryAnswers[Number(question.id)] = score;
      return { ...current, [category]: categoryAnswers };
    });
  };

  const handleComplete = (completedAnswers: Answers) => {
    if (diagnosisMutation.isPending) return;
    const invalidIndex = STEPS.findIndex((item) => {
      const score = completedAnswers[item.category]?.[Number(item.question.id)];
      return !item.options.some((option) => option.score === score);
    });
    if (invalidIndex !== -1) {
      setCurrentIndex(invalidIndex);
      return;
    }

    const categoryTotals = getCategoryTotals(completedAnswers);
    diagnosisMutation.mutate({
      depressionScore: categoryTotals.depression,
      anxietyScore: categoryTotals.anxiety,
      stressScore: categoryTotals.stress,
    });
  };

  const goBack = () => {
    if (diagnosisMutation.isPending) return;
    if (currentIndex === 0) {
      navigate("/diagnosis/character");
      return;
    }

    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const goNext = () => {
    if (selectedAnswer === undefined || diagnosisMutation.isPending) return;

    const categoryAnswers = [...(answers[category] ?? [])];
    categoryAnswers[Number(question.id)] = selectedAnswer;
    const nextAnswers = { ...answers, [category]: categoryAnswers };
    setAnswers(nextAnswers);

    if (currentIndex === STEPS.length - 1) {
      handleComplete(nextAnswers);
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  return (
    <Page>
      <TopContent>
        <TopBar onBackClick={goBack} />
        <DiagnosisProgress current={currentIndex + 1} total={STEPS.length} />
      </TopContent>
      <Content
        question={question}
        options={options}
        type={type}
        selectedAnswer={selectedAnswer}
        onSelect={selectAnswer}
      />
      <Actions>
        {diagnosisMutation.isError && (
          <ErrorMessage role="alert">
            자가진단 결과를 저장하지 못했습니다. 다시 시도해주세요.
          </ErrorMessage>
        )}
        <Button
          variant="primary"
          size="medium"
          label={
            diagnosisMutation.isPending
              ? "저장 중..."
              : currentIndex === STEPS.length - 1
                ? "끝내기"
                : "다음"
          }
          showIcon
          disabled={selectedAnswer === undefined || diagnosisMutation.isPending}
          onClick={goNext}
        />
      </Actions>
    </Page>
  );
};

type ContentProps = Pick<
  (typeof STEPS)[number],
  "question" | "options" | "type"
> & {
  selectedAnswer?: number;
  onSelect: (score: number) => void;
};

const Content = ({
  question,
  options,
  type,
  selectedAnswer,
  onSelect,
}: ContentProps) => {
  const contentGap = type === "choice" ? "2rem" : "4rem";

  return (
    <QuestionContent $gap={contentGap}>
      <QuestionTitle>{question.question}</QuestionTitle>
      {type === "choice" ? (
        <ChoiceContent
          options={options}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
        />
      ) : (
        <ScaleContent
          question={question}
          options={options}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
        />
      )}
    </QuestionContent>
  );
};

type ChoiceProps = Pick<
  ContentProps,
  "options" | "selectedAnswer" | "onSelect"
>;

const ChoiceContent = ({ options, selectedAnswer, onSelect }: ChoiceProps) => (
  <OptionList role="group" aria-label="응답 선택">
    {options.map((option) => (
      <Option
        key={option.score}
        $label={option.label}
        $isSelected={selectedAnswer === option.score}
        onClick={() => onSelect(option.score)}
      />
    ))}
  </OptionList>
);

type ScaleProps = Pick<
  ContentProps,
  "question" | "options" | "selectedAnswer" | "onSelect"
>;

const ScaleContent = ({
  question,
  options,
  selectedAnswer,
  onSelect,
}: ScaleProps) => (
  <Scale
    role="group"
    aria-label={question.question}
    $optionCount={options.length}
  >
    <ScaleSlider
      type="range"
      min={options[0].score}
      max={options[options.length - 1].score}
      step={1}
      value={selectedAnswer ?? options[Math.floor(options.length / 2)].score}
      aria-label={question.question}
      aria-valuetext={
        options.find((option) => option.score === selectedAnswer)?.label
      }
      onChange={(event) => onSelect(Number(event.target.value))}
    />
    <ScaleLabels>
      {options.map((option) => (
        <ScaleLabel
          key={option.score}
          $isSelected={selectedAnswer === option.score}
        >
          {option.label}
        </ScaleLabel>
      ))}
    </ScaleLabels>
  </Scale>
);

const Page = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 0.75rem;
  background: ${COLORS.gray.gray0};
`;

const TopContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const QuestionContent = styled.section<{ $gap: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap};
  padding: 3.3125rem 1.25rem;
`;

const QuestionTitle = styled.h1`
  text-align: center;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const ErrorContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Scale = styled.div<{ $optionCount: number }>`
  --scale-option-count: ${({ $optionCount }) => $optionCount};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ScaleSlider = styled.input`
  width: 19.0625rem;
  height: 1rem;
  display: block;
  margin: 0 auto;
  padding: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 0.25rem;
    background: ${COLORS.gray.gray300};
  }

  &::-webkit-slider-thumb {
    width: 1rem;
    height: 1rem;
    margin-top: -0.375rem;
    border: 0.125rem solid ${COLORS.gray.gray0};
    border-radius: 50%;
    appearance: none;
    background: ${COLORS.main.main};
  }

  &::-moz-range-track {
    height: 0.25rem;
    border: none;
    background: ${COLORS.gray.gray300};
  }

  &::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border: 0.125rem solid ${COLORS.gray.gray0};
    border-radius: 50%;
    background: ${COLORS.main.main};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.main.main};
    outline-offset: 2px;
  }
`;

const ScaleLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(var(--scale-option-count), 1fr);
`;

const ScaleLabel = styled.span<{ $isSelected: boolean }>`
  color: ${({ $isSelected }) =>
    $isSelected ? COLORS.main["main+"] : COLORS.gray.gray900};
  text-align: center;
  white-space: nowrap;
  ${TEXT_STYLE.body.sm};
`;

const ErrorMessage = styled.span`
  color: ${COLORS.state.error};
  ${TEXT_STYLE.body.ti};
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.25rem;
`;
