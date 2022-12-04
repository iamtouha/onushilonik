import { OPTION, SET_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, withProfileProcedure } from "../trpc";

export const questionSetsRouter = router({
  freeTrial: withProfileProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.questionSet.findMany({
      where: { trial: true },
      orderBy: { createdAt: "desc" },
      include: { _count: true },
    });
  }),
  get: withProfileProcedure
    .input(
      z.object({
        type: z.nativeEnum(SET_TYPE).optional(),
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const [count, questionSets] = await ctx.prisma.$transaction([
        ctx.prisma.questionSet.count({
          where: {
            published: true,
            type: input?.type ? input.type : undefined,
          },
        }),
        ctx.prisma.questionSet.findMany({
          where: {
            published: true,
            type: input?.type ? input.type : undefined,
          },
          include: { _count: true },
          skip: (input.page - 1) * input.perPage,
          take: input.perPage,
        }),
      ]);
      return {
        count,
        questionSets,
      };
    }),
  getOne: withProfileProcedure
    .input(
      z.object({
        code: z.string(),
        withAnswerSheet: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.questionSet.findUnique({
        where: { code: input.code },
        include: {
          _count: true,
          questions: {
            select: { question: { select: { id: true } }, order: true },
            orderBy: { order: "asc" },
          },
          answerSheets: input.withAnswerSheet
            ? {
                where: { profileId: ctx.session.user.profileId },
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  createdAt: true,
                  answers: {
                    select: {
                      id: true,
                      question: { select: { id: true, correctOption: true } },
                      option: true,
                    },
                  },
                },
              }
            : undefined,
        },
      });
    }),
  getFreeTrial: withProfileProcedure
    .input(
      z.object({
        code: z.string(),
        withAnswerSheet: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.questionSet.findFirst({
        where: { code: input.code, trial: true },
        include: {
          _count: true,
          questions: {
            select: { question: { select: { id: true } }, order: true },
            orderBy: { order: "asc" },
          },
          answerSheets: input.withAnswerSheet
            ? {
                where: { profileId: ctx.session.user.profileId },
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  createdAt: true,
                  answers: {
                    select: {
                      id: true,
                      question: { select: { id: true, correctOption: true } },
                      option: true,
                    },
                  },
                },
              }
            : undefined,
        },
      });
    }),
});
