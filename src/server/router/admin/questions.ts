import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { OPTION, Prisma } from "@prisma/client";
import { createAdminRouter } from "./admin-router";

export const questionsRouter = createAdminRouter()
  .query("get", {
    input: z.object({
      page: z.number().int().min(0),
      pageSize: z.number().int(),
      stem: z.string().optional(),
      code: z.string().optional(),
      subjectTitle: z.string().optional(),
      chapterTitle: z.string().optional(),
      sortBy: z.enum(["createdAt", "code", "stem", "published"]).optional(),
      sortDesc: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { page, pageSize, stem, code, sortBy, sortDesc } = input;
      const where = {
        stem: { contains: stem },
        code: { contains: code },
        AND: [
          {
            chapter: { title: { contains: input.chapterTitle ?? "" } },
          },
          {
            chapter: {
              subject: { title: { contains: input.subjectTitle ?? "" } },
            },
          },
        ],
      };
      const orderBy = sortBy
        ? {
            [sortBy]: sortDesc ? "desc" : "asc",
          }
        : undefined;

      const [total, questions] = await ctx.prisma.$transaction([
        ctx.prisma.question.count({ where }),
        ctx.prisma.question.findMany({
          where,
          orderBy,
          skip: page * pageSize,
          take: pageSize,
          include: {
            chapter: {
              select: {
                title: true,
                id: true,
                subject: { select: { title: true, id: true } },
              },
            },
          },
        }),
      ]);

      return {
        questions,
        count: total,
      };
    },
  })
  .query("getOne", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const question = await ctx.prisma.question.findUnique({
        where: { id: input },
        include: {
          chapter: { select: { id: true, subjectId: true } },
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
        },
      });
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No question found with this ID",
        });
      }
      return question;
    },
  })
  .query("list", {
    input: z.string().optional(),
    async resolve({ ctx, input: chapterId }) {
      const questions = await ctx.prisma.question.findMany({
        where: chapterId ? { chapterId } : {},
        select: { id: true, code: true },
      });
      return questions;
    },
  })
  .mutation("add", {
    input: z.object({
      stem: z.string().min(2).max(1024),
      code: z.string().min(2).max(100),
      optionA: z.string().trim().min(1).max(100),
      optionB: z.string().trim().min(1).max(100),
      optionC: z.string().trim().min(1).max(100),
      optionD: z.string().trim().min(1).max(100),
      correctOption: z.nativeEnum(OPTION),
      noteId: z.string().nullish(),
      published: z.boolean(),
      chapterId: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        const question = await ctx.prisma.question.create({
          data: {
            chapterId: input.chapterId,
            stem: input.stem,
            code: input.code,
            optionA: input.optionA,
            optionB: input.optionB,
            optionC: input.optionC,
            optionD: input.optionD,
            correctOption: input.correctOption,
            published: input.published,
            noteId: input.noteId || null,
            createdById: ctx.session?.user.id,
          },
        });
        return question;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Code already exists",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string(),
      stem: z.string().min(2).max(1024),
      code: z.string().min(2).max(100),
      optionA: z.string().trim().min(1).max(100),
      optionB: z.string().trim().min(1).max(100),
      optionC: z.string().trim().min(1).max(100),
      optionD: z.string().trim().min(1).max(100),
      correctOption: z.nativeEnum(OPTION),
      noteId: z.string().nullish(),
      published: z.boolean(),
      chapterId: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        const question = await ctx.prisma.question.update({
          where: { id: input.id },
          data: {
            chapterId: input.chapterId,
            stem: input.stem,
            code: input.code,
            optionA: input.optionA,
            optionB: input.optionB,
            optionC: input.optionC,
            optionD: input.optionD,
            noteId: input.noteId || null,
            correctOption: input.correctOption,
            published: input.published,
            updatedById: ctx.session?.user.id,
          },
        });
        return question;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Code already exists",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    },
  })
  .mutation("delete", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const question = await ctx.prisma.question.delete({
        where: { id: input },
      });
      return question;
    },
  });
