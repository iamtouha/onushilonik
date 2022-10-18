import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma, SET_TYPE } from "@prisma/client";
import { createAdminRouter } from "./admin-router";

// type orderByType = { [key: string]: "asc" | "desc" } | undefined;

export const questionSetsRouter = createAdminRouter()
  .query("get", {
    input: z.object({
      page: z.number().int().min(0),
      pageSize: z.number().int(),
      title: z.string().optional(),
      code: z.string().optional(),
      type: z.nativeEnum(SET_TYPE).optional(),
      sortBy: z
        .enum(["createdAt", "title", "type", "code", "published", "trial"])
        .optional(),
      sortDesc: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const where = {
        title: { contains: title },
        code: { contains: code },
        type: input.type,
      };

      const orderBy = sortBy
        ? {
            [sortBy]: sortDesc ? "desc" : "asc",
          }
        : undefined;
      try {
        const [count, questionSets] = await ctx.prisma.$transaction([
          ctx.prisma.questionSet.count({ where }),
          ctx.prisma.questionSet.findMany({
            where,
            orderBy,
            skip: page * pageSize,
            take: pageSize,
            include: { _count: true },
          }),
        ]);
        return {
          questionSets,
          count,
        };
      } catch (error) {
        console.error(error);

        throw new TRPCError({
          message: "Something Went Wrong!",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  })
  .query("getOne", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const questionSet = await ctx.prisma.questionSet.findUnique({
        where: { id: input },
        include: {
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
          questions: {
            orderBy: { order: "asc" },
            select: {
              question: {
                select: {
                  id: true,
                  stem: true,
                  code: true,
                },
              },
            },
          },
          _count: true,
        },
      });
      if (!questionSet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No question set found with this ID",
        });
      }
      return {
        ...questionSet,
        questions: questionSet.questions.map((q) => q.question),
      };
    },
  })
  .query("list", {
    async resolve({ ctx }) {
      const questionSets = await ctx.prisma.questionSet.findMany({
        select: { id: true, title: true },
      });
      return questionSets;
    },
  })
  .mutation("add", {
    input: z.object({
      title: z.string().min(2).max(100),
      code: z.string().min(2).max(100),
      type: z.nativeEnum(SET_TYPE),
      published: z.boolean(),
      questions: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      const { title, code, published, type, questions } = input;
      try {
        const questionSet = await ctx.prisma.questionSet.create({
          data: {
            title,
            code,
            published,
            type,
            questions: {
              create: questions.map((id, i) => ({
                question: { connect: { id } },
                order: i + 1,
              })),
            },
            createdById: ctx.session?.user.id,
          },
        });
        return questionSet;
      } catch (e) {
        console.error(e);
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
      title: z.string().min(2).max(100),
      code: z.string().min(2).max(100),
      type: z.nativeEnum(SET_TYPE),
      published: z.boolean(),
      trial: z.boolean(),
      questions: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      const { id, title, code, published, questions } = input;
      try {
        const questionSet = await ctx.prisma.questionSet.update({
          where: { id },
          data: {
            title,
            code,
            published,
            trial: input.trial,
            questions: {
              deleteMany: {},
              create: questions.map((id, i) => ({
                question: { connect: { id } },
                order: i + 1,
              })),
            },
            updatedById: ctx.session?.user.id,
          },
        });
        return questionSet;
      } catch (e) {
        console.error(e);

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
      const questionSet = await ctx.prisma.questionSet.delete({
        where: { id: input },
      });
      return questionSet;
    },
  });
