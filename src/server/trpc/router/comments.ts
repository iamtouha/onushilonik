import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, withProfileProcedure } from "../trpc";

export const commentsRouter = router({
  get: withProfileProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.prisma.comment.findMany({
      where: { questionId: input },
      include: { profile: { select: { fullName: true, id: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),
  create: withProfileProcedure
    .input(
      z.object({ questionId: z.string(), content: z.string().min(1).max(156) })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.comment.create({
        data: {
          questionId: input.questionId,
          content: input.content,
          profileId: ctx.session.user.profileId,
        },
      });
    }),
  delete: withProfileProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const comment = ctx.prisma.comment.findFirst({
        where: { id: input, profileId: ctx.session.user.profileId },
      });
      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
      return await ctx.prisma.comment.delete({ where: { id: input } });
    }),
});
