import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const questionSetRouter = createProtectedRouter()
  .query("free-trial", {
    async resolve({ ctx }) {
      return await ctx.prisma.questionSet.findMany({
        where: { trial: true },
        orderBy: { createdAt: "desc" },
        include: { _count: true },
      });
    },
  })
  .query("trial-set", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const trialSet = await ctx.prisma.questionSet.findFirst({
        where: { id: input.id, trial: true },
        include: {
          _count: true,
          questions: {
            select: {
              question: {
                select: { id: true },
              },
              order: true,
            },

            orderBy: { order: "asc" },
          },
          answerSheets: {
            where: { userId: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              createdAt: true,
              answers: {
                select: {
                  id: true,
                  question: {
                    select: { id: true, correctOption: true },
                  },
                  option: true,
                },
              },
            },
          },
        },
      });
      if (!trialSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question set not found",
        });
      }
      const mark = trialSet.answerSheets.map((sheet) => {
        let total = 0;
        sheet.answers.forEach((answer) => {
          if (answer.question.correctOption === answer.option) total++;
        });
        return { id: sheet.id, mark: total / trialSet.questions.length };
      });
      return {
        set: trialSet,
        marks: mark,
      };
    },
  });
