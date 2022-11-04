import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const questionBankRouter = createProtectedRouter()
  .query("subjects", {
    async resolve({ ctx }) {
      return await ctx.prisma.subject.findMany({
        where: { published: true },
      });
    },
  })
  .query("subject", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.subject.findFirst({
        where: { id: input.id, published: true },
        include: {
          chapters: {
            where: { published: true },
            include: { questionSets: { where: { published: true } } },
          },
        },
      });
    },
  });
