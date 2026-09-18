import { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
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

export type CategoryResult = {
  score: number;
  maxScore: number;
};

export type DiagnosisState = Record<DiagnosisCategory, CategoryResult>;

const getCategoryTotals = (answers: Answers): DiagnosisState => {
  return Object.fromEntries(
    DIAGNOSIS_CATEGORIES.map((category) => {
      const { questions, options } = getQuestionsByCategory(category);
      const maxScore =
        questions.length * Math.max(...options.map((option) => option.score));
      const score = (answers[category] ?? []).reduce<number>(
        (sum, score) => sum + (score ?? 0),
        0,
      );

      return [category, { score, maxScore }];
    }),
  ) as DiagnosisState;
};

const STEPS = DIAGNOSIS_CATEGORIES.flatMap((category) => {
  const { questions, options, type } = getQuestionsByCategory(category);
  return questions.map((question) => ({ category, question, options, type }));
});

export const SelfDiagnosis = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(
      DIAGNOSIS_CATEGORIES.map((category) => [
        category,
        Array<number | null>(
          getQuestionsByCategory(category).totalQuestions,
        ).fill(null),
      ]),
    ),
  );
  const step = STEPS[currentIndex];

  if (!step) {
    return (
      <Page>
        <p>등록된 자가진단 질문이 없습니다.</p>
      </Page>
    );
  }

  const { category, question, options, type } = step;
  const selectedAnswer = answers[category]?.[Number(question.id)] ?? undefined;

  const selectAnswer = (score: number) => {
    setAnswers((current) => {
      const categoryAnswers = [...(current[category] ?? [])];
      categoryAnswers[Number(question.id)] = score;
      return { ...current, [category]: categoryAnswers };
    });
  };

  const handleComplete = () => {
    const invalidIndex = STEPS.findIndex((item) => {
      const score = answers[item.category]?.[Number(item.question.id)];
      return !item.options.some((option) => option.score === score);
    });
    if (invalidIndex !== -1) {
      setCurrentIndex(invalidIndex);
      return;
    }

    const categoryTotals = getCategoryTotals(answers);
    navigate("/diagnosis/result", { state: categoryTotals });
  };

  const goNext = () => {
    if (selectedAnswer === undefined) return;

    if (currentIndex === STEPS.length - 1) {
      handleComplete();
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  return (
    <Page>
      <TopContent>
        <TopBar
          onBackClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
        />
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
        <Button
          variant="primary"
          size="medium"
          label={currentIndex === STEPS.length - 1 ? "끝내기" : "다음"}
          showIcon
          disabled={selectedAnswer === undefined}
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
  <OptionList>
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

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.25rem;
`;
