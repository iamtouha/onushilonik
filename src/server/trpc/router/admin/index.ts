import { router } from "@/server/trpc/trpc";
import { chaptersAdminRouter } from "./chapters";
import { notesAdminRouter } from "./notes";
import { paymentsAdminRouter } from "./payments";
import { questionSetsAdminRouter } from "./questionSets";
import { questtionsAdminRouter } from "./questions";
import { subjectsAdminRouter } from "./subjects";
import { usersAdminRouter } from "./users";

export const adminRouter = router({
  subjects: subjectsAdminRouter,
  questions: questtionsAdminRouter,
  chapters: chaptersAdminRouter,
  notes: notesAdminRouter,
  payments: paymentsAdminRouter,
  questionSets: questionSetsAdminRouter,
  users: usersAdminRouter,
});
