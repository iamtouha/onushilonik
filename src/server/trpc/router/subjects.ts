import { OPTION, Prisma, SET_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, withProfileProcedure } from "../trpc";

export const subjectsRouter = router({
  get: withProfileProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.subject.findMany({ where: { published: true } });
  }),
  getOne: withProfileProcedure
    .input(
      z.object({
        id: z.string(),
        populate: z
          .enum(["chapters", "questions", "questionSets", "notes"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let include: Prisma.SubjectInclude | undefined;
      switch (input.populate) {
        case "chapters":
          include = { chapters: true };
          break;
        case "questions":
          include = { chapters: { include: { questions: true } } };
          break;
        case "questionSets":
          include = { chapters: { include: { questionSets: true } } };
          break;
        case "notes":
          include = { chapters: { include: { notes: true } } };
          break;
        default:
          include = undefined;
      }

      return ctx.prisma.subject.findUnique({
        where: { id: input.id },
        include,
      });
    }),
  getNotes: withProfileProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.subject.findFirst({
        where: { code: input.code },
        include: { chapters: { include: { notes: true } } },
      });
    }),
  getQuestionBanks: withProfileProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.subject.findFirst({
        where: { code: input.code },
        include: {
          chapters: {
            include: {
              questionSets: {
                where: {
                  type: SET_TYPE.QUESTION_BANK,
                  published: true,
                },
                include: { _count: true },
              },
            },
          },
        },
      });
    }),
});
