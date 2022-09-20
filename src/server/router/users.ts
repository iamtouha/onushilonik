import { z } from "zod";
import { createAdminRouter } from "./admin-router";

export const usersRouter = createAdminRouter().query("getAll", {
  input: z
    .object({ page: z.number().int(), take: z.number().int() })
    .default({ page: 1, take: 10 }),
  async resolve({ ctx, input }) {
    return await ctx.prisma.user.findMany({
      skip: (input.page - 1) * input.take,
      take: input.take,
    });
  },
});
