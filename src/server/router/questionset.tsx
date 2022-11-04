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
  .query("prev-questions", {
    input: z.object({
      page: z.number(),
      perPage: z.number(),
    }),
    async resolve({ ctx, input }) {
      const { page, perPage } = input;
      const questionSet = await ctx.prisma.$transaction([
        ctx.prisma.questionSet.findMany({
          where: { published: true },
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
          include: { _count: true },
        }),
        ctx.prisma.questionSet.count({ where: { published: true } }),
      ]);
      return {
        questionSets: questionSet[0],
        total: questionSet[1],
      };
    },
  })
  .query("get", {
    input: z.object({ code: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.questionSet.findFirst({
        where: { code: input.code },
        include: {
          questions: {
            select: {
              question: {
                select: { id: true },
              },
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
    },
  })
  .query("get-all", {
    input: z.object({ code: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.questionSet.findUnique({
        where: { code: input.code },
        include: {
          _count: true,
          questions: {
            select: {
              question: {
                select: { id: true },
              },
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
              expireAt: true,
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
      return trialSet;
    },
  });
