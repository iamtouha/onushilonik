import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, adminProcedure } from "../../trpc";

export const subjectsAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0),
        pageSize: z.number().int(),
        title: z.string().optional(),
        code: z.string().optional(),
        sortBy: z.enum(["createdAt", "title", "code", "published"]).optional(),
        sortDesc: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const params: Prisma.SubjectFindManyArgs = {
        where: { title: { contains: title }, code: { contains: code } },
        orderBy: sortBy ? { [sortBy]: sortDesc ? "desc" : "asc" } : undefined,
        skip: page * pageSize,
        take: pageSize,
        include: { _count: true },
      };
      const [count, subjects] = await ctx.prisma.$transaction([
        ctx.prisma.subject.count({ where: params.where }),
        ctx.prisma.subject.findMany({ ...params, include: { _count: true } }),
      ]);

      return {
        subjects,
        count,
      };
    }),
  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const subject = await ctx.prisma.subject.findUnique({
      where: { id: input },
      include: {
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
    });
    if (!subject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subject found with this ID",
      });
    }
    return subject;
  }),
  list: adminProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input: chapterId }) => {
      const subjects = await ctx.prisma.subject.findMany({
        select: { id: true, title: true },
      });
      return subjects;
    }),
  add: adminProcedure
    .input(
      z.object({
        title: z.string().min(2).max(100),
        code: z.string().min(2).max(100),
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, code, published } = input;
      try {
        const subject = await ctx.prisma.subject.create({
          data: {
            title,
            code,
            published,
            createdById: ctx.session?.user.id,
          },
        });
        return subject;
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
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, published } = input;

      const subject = await ctx.prisma.subject.update({
        where: { id },
        data: {
          title,
          published,
          updatedById: ctx.session?.user.id,
        },
      });
      return subject;
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const subject = await ctx.prisma.subject.delete({
      where: { id: input },
    });
    return subject;
  }),
});
