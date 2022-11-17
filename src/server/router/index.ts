import superjson from "superjson";
import { createRouter } from "./context";
import { adminRouter } from "./admin";
import { subscriptionRouter } from "./subscription";
import { accountRouter } from "./account";
import { questionSetRouter } from "./questionset";
import { questionRouter } from "./question";
import { answerSheetRouter } from "./answersheet";
import { questionBankRouter } from "./question-bank";
import { shortNotesRouter } from "./short-notes";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("admin.", adminRouter)
  .merge("account.", accountRouter)
  .merge("subscription.", subscriptionRouter)
  .merge("questionset.", questionSetRouter)
  .merge("question.", questionRouter)
  .merge("answersheet.", answerSheetRouter)
  .merge("shortnotes.", shortNotesRouter)
  .merge("questionbank.", questionBankRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
