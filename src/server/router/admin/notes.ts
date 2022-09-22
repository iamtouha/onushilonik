import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { OPTION, Prisma } from "@prisma/client";
import { createAdminRouter } from "./admin-router";

export const notesRouter = createAdminRouter()
  .query("get", {
    input: z.object({
      page: z.number().int().min(0),
      pageSize: z.number().int(),
      title: z.string().optional(),
      code: z.string().optional(),
      subjectTitle: z.string().optional(),
      chapterTitle: z.string().optional(),
      sortBy: z.enum(["createdAt", "code", "title", "published"]).optional(),
      sortDesc: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const where = {
        title: { contains: title },
        code: { contains: code },
        chapter: {
          title: { contains: input.chapterTitle },
          subject: { title: { contains: input.subjectTitle } },
        },
      };
      const orderBy = sortBy
        ? {
            [sortBy]: sortDesc ? "desc" : "asc",
          }
        : undefined;

      const [total, notes] = await ctx.prisma.$transaction([
        ctx.prisma.note.count({ where }),
        ctx.prisma.note.findMany({
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
        notes,
        count: total,
      };
    },
  })
  .query("getOne", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const note = await ctx.prisma.note.findUnique({
        where: { id: input },
        include: {
          chapter: { select: { id: true, subjectId: true } },
          createdBy: { select: { name: true } },
          updatedBy: { select: { name: true } },
        },
      });
      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No note found with this ID",
        });
      }
      return note;
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
      title: z.string(),
      content: z.string().min(2).max(1024),
      code: z.string().min(2).max(100),
      published: z.boolean(),
      chapterId: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        const note = await ctx.prisma.note.create({
          data: {
            chapterId: input.chapterId,
            content: input.content,
            code: input.code,
            title: input.title,
            published: input.published,
            createdById: ctx.session?.user.id,
          },
        });
        return note;
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
      title: z.string(),
      content: z.string().min(2).max(1024),
      code: z.string().min(2).max(100),
      published: z.boolean(),
      chapterId: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        const note = await ctx.prisma.note.update({
          where: { id: input.id },
          data: {
            chapterId: input.chapterId,
            content: input.content,
            code: input.code,
            title: input.title,
            published: input.published,
            updatedById: ctx.session?.user.id,
          },
        });
        return note;
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
      const note = await ctx.prisma.note.delete({
        where: { id: input },
      });
      return note;
    },
  });
