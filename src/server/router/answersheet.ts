import { ANSWERSHEET_STATUS, OPTION } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const answerSheetRouter = createProtectedRouter()
  .query("get", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.answerSheet.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        include: {
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
      });
    },
  })
  .mutation("create", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const questionSet = await ctx.prisma.questionSet.findUnique({
        where: { id: input.id },
      });
      if (!questionSet) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Question set not found",
        });
      }
      return await ctx.prisma.answerSheet.create({
        data: {
          expireAt:
            questionSet.duration > 0
              ? new Date(Date.now() + questionSet.duration * 60 * 1000)
              : undefined,
          questionSetId: input.id,
          userId: ctx.session.user.id,
        },
      });
    },
  })
  .mutation("add-answer", {
    input: z.object({
      answerSheetId: z.string(),
      questionId: z.string(),
      option: z.nativeEnum(OPTION),
    }),
    async resolve({ ctx, input }) {
      const answerSheet = await ctx.prisma.answerSheet.findFirst({
        where: { id: input.answerSheetId, userId: ctx.session.user.id },
      });

      if (!answerSheet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Answer sheet not found",
        });
      }
      if (answerSheet.expireAt && answerSheet.expireAt.getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Answer sheet expired",
        });
      }
      if (answerSheet.status !== ANSWERSHEET_STATUS.ONGOING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Test is already submitted",
        });
      }
      return await ctx.prisma.answer.create({
        data: {
          answerSheetId: input.answerSheetId,
          questionId: input.questionId,
          option: input.option,
        },
      });
    },
  });
