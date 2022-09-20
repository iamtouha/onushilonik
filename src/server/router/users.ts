import { USER_ROLE } from "@prisma/client";
import { z } from "zod";
import { createAdminRouter } from "./admin-router";

export const usersRouter = createAdminRouter()
  .query("getAll", {
    input: z.object({
      page: z.number().int(),
      size: z.number().int(),
      email: z.string().optional(),
      name: z.string().optional(),
      role: z.nativeEnum(USER_ROLE).optional(),
      sortBy: z.enum(["email", "name", "role", "createdAt"]).optional(),
      sortDesc: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      const needFilter = input.email || input.name || input.role;

      const query = {
        skip: input.page * input.size,
        take: input.size,
        orderBy: input.sortBy
          ? { [input.sortBy]: input.sortDesc ? "desc" : "asc" }
          : undefined,
        where: needFilter
          ? {
              AND: {
                email: input.email ? { contains: input.email } : undefined,
                name: input.name ? { contains: input.name } : undefined,
                role: input.role,
              },
            }
          : undefined,
      };

      const [count, users] = await ctx.prisma.$transaction([
        ctx.prisma.user.count(query),
        ctx.prisma.user.findMany(query),
      ]);
      return { count, users };
    },
  })
  .query("getOne", {
    input: z.string(),
    async resolve({ ctx, input }) {
      return ctx.prisma.user.findUnique({ where: { id: input } });
    },
  });
