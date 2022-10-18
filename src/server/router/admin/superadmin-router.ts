import { USER_ROLE } from "@prisma/client";
import * as trpc from "@trpc/server";
import { createRouter } from "../context";

export function createSuperAdminRouter() {
  return createRouter().middleware(({ ctx, next }) => {
    const session = ctx.session;
    if (!session || !session.user) {
      throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
    }
    if (session.user.role !== USER_ROLE.SUPER_ADMIN) {
      throw new trpc.TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...session, user: session.user },
      },
    });
  });
}
