import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const accountRouter = createProtectedRouter()
  .query("get", {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          subscription: {
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
      const [sheet, payment] = await ctx.prisma.$transaction([
        ctx.prisma.answerSheet.findFirst({
          where: { id: input.sheetId, userId: ctx.session.user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, createdAt: true },
        }),
        ctx.prisma.payment.findFirst({
          where: {
            subscription: { userId: ctx.session.user.id },
          },
        }),
      ]);
    },
  });
