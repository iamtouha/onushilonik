import { createContext, useState, type ReactNode } from "react";
import type { AnswerSheet, OPTION, Prisma, QuestionSet } from "@prisma/client";

type QuestionSetWithQuestion = QuestionSet & {
  questions: {
    order: number;
    question: {
      id: string;
    };
  }[];
  _count: Prisma.QuestionSetCountOutputType;
};

type AnswerSheetWithAnswer = AnswerSheet & {
  answers: {
    question: {
      id: string;
      correctOption: OPTION;
    };
    id: string;
    option: OPTION;
  }[];
};

type ContextProps = {
  questionSet?: QuestionSetWithQuestion;
  answerSheet?: AnswerSheetWithAnswer;
  marks?: { id: string; mark: number }[];
  setQuestionSet: (questionSet: QuestionSetWithQuestion) => void;
  setAnswerSheet: (answerSheet: AnswerSheetWithAnswer) => void;
};

const SheetContext = createContext<ContextProps>({
  setAnswerSheet: () => null,
  setQuestionSet: () => null,
} as ContextProps);

export default SheetContext;

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [questionSet, setQuestionSet] = useState<QuestionSetWithQuestion>();
  const [answerSheet, setAnswerSheet] = useState<AnswerSheetWithAnswer>();

  return (
    <SheetContext.Provider
      value={{
        questionSet,
        answerSheet,
        setQuestionSet,
        setAnswerSheet,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
};
