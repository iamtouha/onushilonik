import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const shortNotesRouter = createProtectedRouter()
  .query("subjects", {
    async resolve({ ctx }) {
      return await ctx.prisma.subject.findMany({
        where: { published: true },
      });
    },
  })
  .query("subject", {
    input: z.object({ code: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.subject.findFirst({
        where: { code: input.code, published: true },
        include: {
          chapters: {
            where: { published: true },
            include: {
              notes: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    },
  })
  .query("get", {
    input: z.object({ code: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.findFirst({
        where: { code: input.code, published: true },
      });
    },
  });
