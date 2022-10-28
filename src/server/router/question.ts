import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const questionRouter = createProtectedRouter()
  .query("get", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.question.findUnique({ where: { id: input.id } });
    },
  })
  .query("get-answer", {
    input: z.object({ id: z.string(), sheetId: z.string() }),
    async resolve({ ctx, input }) {
      const data = await ctx.prisma.question.findUnique({
        where: { id: input.id },
        include: { answers: { where: { answerSheetId: input.sheetId } } },
      });
      return data;
    },
  })
  .query("get-stats", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.answer.groupBy({
        by: ["option"],
        where: { questionId: input.id },
        _count: true,
      });
    },
  });