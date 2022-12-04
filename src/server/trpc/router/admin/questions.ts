import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
import { OPTION, PAYMENT_STATUS, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const questtionsAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0),
        pageSize: z.number().int(),
        stem: z.string().optional(),
        code: z.string().optional(),
        subjectTitle: z.string().optional(),
        chapterTitle: z.string().optional(),
        sortBy: z.enum(["createdAt", "code", "stem", "published"]).optional(),
        sortDesc: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        stem,
        code,
        sortBy,
        sortDesc,
        subjectTitle,
        chapterTitle,
      } = input;
      const params: Prisma.QuestionFindManyArgs = {
        where: {
          stem: { contains: stem },
          code: { contains: code },
          AND: [
            { chapter: { title: { contains: chapterTitle ?? "" } } },
            {
              chapter: { subject: { title: { contains: subjectTitle ?? "" } } },
            },
          ],
        },
        orderBy: sortBy ? { [sortBy]: sortDesc ? "desc" : "asc" } : undefined,
        skip: page * pageSize,
        take: pageSize,
      };

      const [total, questions] = await ctx.prisma.$transaction([
        ctx.prisma.question.count({ where: params.where }),
        ctx.prisma.question.findMany({
          ...params,
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
    }),
  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
  }),
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(PAYMENT_STATUS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          approvedAt:
            input.status === PAYMENT_STATUS.SUCCESS ? new Date() : null,
        },
      });
      return payment;
    }),
  list: adminProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input: chapterId }) => {
      const questions = await ctx.prisma.question.findMany({
        where: chapterId ? { chapterId } : {},
        select: { id: true, code: true, stem: true },
      });
      return questions;
    }),
  add: adminProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        stem: z.string().min(2).max(1024),
        optionA: z.string().trim().min(1).max(100),
        optionB: z.string().trim().min(1).max(100),
        optionC: z.string().trim().min(1).max(100),
        optionD: z.string().trim().min(1).max(100),
        correctOption: z.nativeEnum(OPTION),
        noteId: z.string().nullish(),
        published: z.boolean(),
        chapterId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.update({
        where: { id: input.id },
        data: {
          chapterId: input.chapterId,
          stem: input.stem,
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
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const question = await ctx.prisma.question.delete({ where: { id: input } });
    return question;
  }),
});
