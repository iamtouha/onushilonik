import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createAdminRouter } from "./admin-router";

export const chaptersRouter = createAdminRouter()
  .query("get", {
    input: z.object({
      page: z.number().int().min(0),
      pageSize: z.number().int(),
      title: z.string().optional(),
      code: z.string().optional(),
      subjectTitle: z.string().optional(),
      sortBy: z.enum(["createdAt", "title", "code", "published"]).optional(),
      sortDesc: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const where = {
        title: { contains: title },
        code: { contains: code },
        subject: { title: { contains: input.subjectTitle } },
      };
      const orderBy = sortBy
        ? {
            [sortBy]: sortDesc ? "desc" : "asc",
          }
        : undefined;

      const [count, chapters] = await ctx.prisma.$transaction([
        ctx.prisma.chapter.count({ where }),
        ctx.prisma.chapter.findMany({
          where,
          orderBy,
          skip: page * pageSize,
          take: pageSize,
          include: {
            _count: true,
            subject: { select: { title: true, id: true } },
          },
        }),
      ]);

      return {
        chapters,
        count,
      };
    },
  })
  .query("getOne", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const chapter = await ctx.prisma.chapter.findUnique({
        where: { id: input },
        include: {
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
        },
      });
      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No chapter found with this ID",
        });
      }
      return chapter;
    },
  })
  .query("list", {
    input: z.string().optional(),
    async resolve({ ctx, input: subjectId }) {
      const chapters = await ctx.prisma.chapter.findMany({
        where: subjectId ? { subjectId } : {},
        select: { id: true, title: true },
      });
      return chapters;
    },
  })
  .mutation("add", {
    input: z.object({
      title: z.string().min(2).max(100),
      code: z.string().min(2).max(100),
      published: z.boolean(),
      subjectId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { title, code, published, subjectId } = input;
      try {
        const chapter = await ctx.prisma.chapter.create({
          data: {
            subjectId,
            title,
            code,
            published,
            createdById: ctx.session?.user.id,
          },
        });
        return chapter;
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
      title: z.string().min(2).max(100),
      code: z.string().min(2).max(100),
      subjectId: z.string(),
      published: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const { id, title, code, published, subjectId } = input;
      try {
        const chapter = await ctx.prisma.chapter.update({
          where: { id },
          data: {
            subjectId,
            title,
            code,
            published,
            updatedById: ctx.session?.user.id,
          },
        });
        return chapter;
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
      const chapter = await ctx.prisma.chapter.delete({
        where: { id: input },
      });
      return chapter;
    },
  });
