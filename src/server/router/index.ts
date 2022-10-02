// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { adminRouter } from "./admin";
import { subscriptionRouter } from "./subscription";
import { accountRouter } from "./account";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("admin.", adminRouter)
  .merge("account.", accountRouter)
  .merge("subscription.", subscriptionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
