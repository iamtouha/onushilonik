import * as trpc from "@trpc/server";
import { createProtectedRouter } from "./protected-router";

export function createWithProfileRouter() {
  return createProtectedRouter().middleware(({ ctx, next }) => {
    if (!ctx.session.user.profileId) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
}
