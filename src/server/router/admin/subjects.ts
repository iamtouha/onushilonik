import { USER_ROLE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createAdminRouter } from "./admin-router";
import { resolve } from "path";

export const subjectsRouter = createAdminRouter()
  .query("get", {
    input: z.object({
      page: z.number().int().min(0),
      pageSize: z.number().int(),
      title: z.string().optional(),
      code: z.string().optional(),
      sortBy: z.enum(["createdAt", "title", "code", "published"]).optional(),
      sortDesc: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { page, pageSize, title, code, sortBy, sortDesc } = input;
      const where = {
        title: { contains: title },
        code: { contains: code },
      };
      const orderBy = sortBy
        ? {
            [sortBy]: sortDesc ? "desc" : "asc",
          }
        : undefined;

      const [count, subjects] = await ctx.prisma.$transaction([
        ctx.prisma.subject.count({ where }),
        ctx.prisma.subject.findMany({
          where,
          orderBy,
          skip: page * pageSize,
          take: pageSize,
          include: { _count: true },
        }),
      ]);

      return {
        subjects,
        count,
      };
    },
  })
  .mutation("add", {
    input: z.object({
      title: z.string().min(3).max(100),
      code: z.string().min(3).max(100),
      published: z.boolean(),
    }),
    async resolve({ ctx, input }) {
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
    },
  });
