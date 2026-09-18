export type DiagnosisCategory = "depression" | "anxiety" | "stress";

export const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  "depression",
  "anxiety",
  "stress",
] as const;

export const DIAGNOSIS_CATEGORY_LABELS: Record<DiagnosisCategory, string> = {
  depression: "우울",
  anxiety: "불안",
  stress: "스트레스",
};

type OptionCategory = "choice" | "slider";

type Option = {
  label: string;
  score: number;
};

export const OPTIONS: Record<OptionCategory, Option[]> = {
  choice: [
    {
      label: "전혀 없음",
      score: 1,
    },
    {
      label: "거의 없음",
      score: 2,
    },
    {
      label: "많음",
      score: 3,
    },
    {
      label: "매우 많음",
      score: 4,
    },
  ],
  slider: [
    {
      label: "전혀 없음",
      score: 1,
    },
    {
      label: "거의 없음",
      score: 2,
    },
    {
      label: "보통",
      score: 3,
    },
    {
      label: "많음",
      score: 4,
    },
    {
      label: "매우 많음",
      score: 5,
    },
  ],
} as const;

export type Question = {
  id: string;
  question: string;
};

export type Diagnosis = {
  questions: Question[];
  options: Option[];
};

export const DIAGNOSIS_QUESTIONS: Record<DiagnosisCategory, Diagnosis> = {
  depression: {
    questions: [
      {
        id: "0",
        question: "일 또는 여가 활동을 하는데 흥미나 즐거움을 느끼지 못함",
      },
      {
        id: "1",
        question: "입맛이 지나치게 없거나 식욕이 지나치게 넘침",
      },
      {
        id: "2",
        question: "잠이 들거나 계속 잠을 자는 것이 어려움",
      },
      {
        id: "3",
        question: "피곤하다고 느끼거나 기운이 거의 없음",
      },
      {
        id: "4",
        question: "자신은 열등하다고 생각한 적이 있음",
      },
      {
        id: "5",
        question: "일에 집중하는 것이 어려움",
      },
      {
        id: "6",
        question: "자신을 해치고 싶은 충동이 듦",
      },
    ],
    options: OPTIONS.choice,
  },
  anxiety: {
    questions: [
      {
        id: "0",
        question: "종종 이유 없이 초조하고 불안함",
      },
      {
        id: "1",
        question: "불확실한 미래가 두려움",
      },
      {
        id: "2",
        question: "편한 상태로 있기 어려움",
      },
      {
        id: "3",
        question: "쉽게 짜증이 나거나 쉽게 성을 냄",
      },
      {
        id: "4",
        question: "두통을 느끼는 경우가 많음",
      },
      {
        id: "5",
        question: "가만히 있는 것이 힘듦",
      },
    ],

    options: OPTIONS.choice,
  },
  stress: {
    questions: [
      {
        id: "0",
        question: "예상치 못한 일이 생겨서 기분 나빠진 적이 있음",
      },
      {
        id: "1",
        question: "중요한 일들을 통제할 수 없다고 느낌",
      },
      {
        id: "2",
        question: "말수가 적어지고 생각에 깊이 잠김",
      },
      {
        id: "3",
        question: "해야할 일에 대해 자신이 없음",
      },
      {
        id: "4",
        question: "가슴이 답답해 숨이 막힌 적이 있음",
      },
      {
        id: "5",
        question: "집중력이 저하되고 인내력이 없어짐",
      },
    ],
    options: OPTIONS.slider,
  },
} as const;

export const getQuestionsByCategory = (category: DiagnosisCategory) => {
  const diagnosis = DIAGNOSIS_QUESTIONS[category];
  return {
    ...diagnosis,
    totalQuestions: diagnosis.questions.length,
    type: category === "stress" ? "slider" : "choice",
  };
};
