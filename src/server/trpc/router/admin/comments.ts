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

  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const note = await ctx.prisma.note.delete({
      where: { id: input },
    });
    return note;
  }),
});
