import { createProtectedRouter } from "./protected-router";

export const questionSetRouter = createProtectedRouter().query("free-trial", {
  async resolve({ ctx }) {
    return await ctx.prisma.questionSet.findFirst({
      where: {},
    });
  },
});
