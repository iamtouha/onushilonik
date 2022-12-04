import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, adminProcedure } from "../../trpc";

export const notesAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0),
        pageSize: z.number().int(),
        title: z.string().optional(),
        code: z.string().optional(),
        subjectTitle: z.string().optional(),
        chapterTitle: z.string().optional(),
        sortBy: z.enum(["createdAt", "code", "title", "published"]).optional(),
        sortDesc: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        title,
        code,
        sortBy,
        sortDesc,
        chapterTitle,
        subjectTitle,
      } = input;
      const params: Prisma.NoteFindManyArgs = {
        where: {
          title: { contains: title },
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

      const [total, notes] = await ctx.prisma.$transaction([
        ctx.prisma.note.count({ where: params.where }),
        ctx.prisma.note.findMany({
          ...params,
          select: {
            id: true,
            title: true,
            code: true,
            published: true,
            createdAt: true,
            updatedAt: true,
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
    }),
  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
  }),
  list: adminProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input: chapterId }) => {
      const notes = await ctx.prisma.note.findMany({
        where: chapterId ? { chapterId } : {},
        select: { id: true, code: true },
      });
      return notes;
    }),
  add: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().min(2).max(1024),
        code: z.string().min(2).max(100),
        published: z.boolean(),
        chapterId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string().min(2).max(1024),
        published: z.boolean(),
        chapterId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const note = await ctx.prisma.note.update({
          where: { id: input.id },
          data: {
            chapterId: input.chapterId,
            content: input.content,
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
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const note = await ctx.prisma.note.delete({
      where: { id: input },
    });
    return note;
  }),
});
