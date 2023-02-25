import { z } from "zod";
import { router, withProfileProcedure } from "../trpc";

export const notesRouter = router({
  getOne: withProfileProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.note.findUnique({ where: { id: input } });
    }),
  getWithCode: withProfileProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.note.findUnique({ where: { code: input.code } });
    }),
});
