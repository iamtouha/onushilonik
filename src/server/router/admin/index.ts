import { createRouter } from "../context";
import { chaptersRouter } from "./chapters";
import { notesRouter } from "./notes";
import { paymentsRouter } from "./payments";
import { questionSetsRouter } from "./question-sets";
import { questionsRouter } from "./questions";
import { subjectsRouter } from "./subjects";
import { usersRouter } from "./users";

export const adminRouter = createRouter()
  .merge("users.", usersRouter)
  .merge("subjects.", subjectsRouter)
  .merge("chapters.", chaptersRouter)
  .merge("questions.", questionsRouter)
  .merge("notes.", notesRouter)
  .merge("sets.", questionSetsRouter)
  .merge("payments.", paymentsRouter);
