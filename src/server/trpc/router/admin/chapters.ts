import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, adminProcedure } from "../../trpc";

export const chaptersAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0),
        pageSize: z.number().int(),
        title: z.string().optional(),
        code: z.string().optional(),
        subjectTitle: z.string().optional(),
        sortBy: z.enum(["createdAt", "title", "code", "published"]).optional(),
        sortDesc: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const params: Prisma.ChapterFindManyArgs = {
        where: {
          title: { contains: title },
          code: { contains: code },
          subject: { title: { contains: input.subjectTitle } },
        },
        orderBy: sortBy ? { [sortBy]: sortDesc ? "desc" : "asc" } : undefined,
        skip: page * pageSize,
        take: pageSize,
      };

      const [count, chapters] = await ctx.prisma.$transaction([
        ctx.prisma.chapter.count({ where: params.where }),
        ctx.prisma.chapter.findMany({
          ...params,
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
    }),
  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
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
  }),
  list: adminProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input: subjectId }) => {
      const chapters = await ctx.prisma.chapter.findMany({
        where: subjectId ? { subjectId } : {},
        select: { id: true, title: true },
      });
      return chapters;
    }),
  add: adminProcedure
    .input(
      z.object({
        title: z.string().min(2).max(100),
        code: z.string().min(2).max(100),
        published: z.boolean(),
        subjectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(2).max(100),
        subjectId: z.string(),
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, published, subjectId } = input;
      try {
        const chapter = await ctx.prisma.chapter.update({
          where: { id },
          data: {
            subjectId,
            title,
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
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const chapter = await ctx.prisma.chapter.delete({
      where: { id: input },
    });
    return chapter;
  }),
});
