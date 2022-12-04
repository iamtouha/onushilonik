import { OPTION } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, withProfileProcedure } from "../trpc";

export const sheetsRouter = router({
  get: withProfileProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.answerSheet.findMany({
      where: { profileId: ctx.session.user.profileId },
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
  }),
  recent: withProfileProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.answerSheet.findMany({
      where: { profileId: ctx.session.user.profileId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        questionSet: {
          select: { id: true, code: true, title: true, _count: true },
        },
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
  }),
  getOne: withProfileProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.answerSheet.findFirst({
        where: { id: input.id, profileId: ctx.session.user.profileId },
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
    }),
  create: withProfileProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const questionSet = await ctx.prisma.questionSet.findUnique({
        where: { id: input.id },
      });
      if (!questionSet) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
      return await ctx.prisma.answerSheet.create({
        data: {
          expireAt:
            questionSet.duration > 0
              ? new Date(Date.now() + questionSet.duration * 60 * 1000)
              : undefined,
          questionSetId: input.id,
          profileId: ctx.session.user.profileId,
        },
      });
    }),
  addAnswer: withProfileProcedure
    .input(
      z.object({
        answerSheetId: z.string(),
        questionId: z.string(),
        option: z.nativeEnum(OPTION),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const answerSheet = await ctx.prisma.answerSheet.findFirst({
        where: {
          id: input.answerSheetId,
          profileId: ctx.session.user.profileId,
        },
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
          message: "Test time is over.",
        });
      }

      return await ctx.prisma.answer.create({
        data: {
          answerSheetId: input.answerSheetId,
          questionId: input.questionId,
          option: input.option,
        },
      });
    }),
});
