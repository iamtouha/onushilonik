import { createProtectedRouter } from "./protected-router";

export const accountRouter = createProtectedRouter().query("get", {
  async resolve({ ctx }) {
    return await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
  },
});
