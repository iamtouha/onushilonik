import { router } from "../trpc";
import { adminRouter } from "./admin";
import { sheetsRouter } from "./answerSheets";
import { subjectsRouter } from "./subjects";
import { questionSetsRouter } from "./questionSets";
import { userRouter } from "./user";
import { notesRouter } from "./notes";
import { questionsRouter } from "./questions";
import { commentsRouter } from "./comments";

export const appRouter = router({
  admin: adminRouter,
  user: userRouter,
  sheets: sheetsRouter,
  sets: questionSetsRouter,
  subjects: subjectsRouter,
  notes: notesRouter,
  questions: questionsRouter,
  comments: commentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
