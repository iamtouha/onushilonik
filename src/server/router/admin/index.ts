import { createRouter } from "../context";
import { subjectsRouter } from "./subjects";
import { usersRouter } from "./users";

export const adminRouter = createRouter()
  .merge("users.", usersRouter)
  .merge("subjects.", subjectsRouter);
