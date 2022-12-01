import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const accountRouter = createProtectedRouter()
  .mutation("create-profile", {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          profile: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
    },
  })
  .query("get", {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          profile: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });
    },
  })
  .query("can-create", {
    input: z.object({
      sheetId: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session.user.profileId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }
      const [sheet, payment] = await ctx.prisma.$transaction([
        ctx.prisma.answerSheet.findFirst({
          where: { id: input.sheetId, profileId: ctx.session.user.profileId },
          orderBy: { createdAt: "desc" },
          select: { id: true, createdAt: true },
        }),
        ctx.prisma.payment.findFirst({
          where: {
            profileId: ctx.session.user.profileId,
          },
        }),
      ]);
    },
  });
