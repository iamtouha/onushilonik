import { z } from "zod";
import { router, withProfileProcedure } from "../trpc";

export const questionsRouter = router({
  get: withProfileProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.question.findMany({
        where: { chapterId: input.chapterId },
      });
    }),
  getOne: withProfileProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.note.findUnique({ where: { id: input } });
    }),
  getAnswer: withProfileProcedure
    .input(z.object({ id: z.string(), sheetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.question.findUnique({
        where: { id: input.id },
        include: {
          answers: { where: { answerSheetId: input.sheetId } },
        },
      });
    }),
  getStat: withProfileProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.answer.groupBy({
        by: ["option"],
        where: { questionId: input.id },
        _count: true,
      });
    }),
  getNote: withProfileProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.note.findFirst({
        where: { questions: { some: { id: input.id } } },
      });
    }),
});
