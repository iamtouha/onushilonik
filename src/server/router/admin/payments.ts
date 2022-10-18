import { PAYMENT_METHOD, PAYMENT_STATUS } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSuperAdminRouter } from "./superadmin-router";

export const paymentsRouter = createSuperAdminRouter()
  .query("getAll", {
    input: z.object({
      page: z.number().int(),
      size: z.number().int(),
      email: z.string().optional(),
      transactionId: z.string().optional(),
      paymentId: z.string().optional(),
      status: z.nativeEnum(PAYMENT_STATUS).optional(),
      method: z.nativeEnum(PAYMENT_METHOD).optional(),
      sortBy: z
        .enum(["paymentId", "transactionId", "status", "method", "createdAt"])
        .optional(),
      sortDesc: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      const needFilter =
        input.email ||
        input.transactionId ||
        input.paymentId ||
        input.status ||
        input.method;

      const orderBy = input.sortBy
        ? { [input.sortBy]: input.sortDesc ? "desc" : "asc" }
        : undefined;
      const where = needFilter
        ? {
            AND: {
              subscription: {
                user: {
                  email: input.email ? { contains: input.email } : undefined,
                },
              },
              transactionId: input.transactionId
                ? { contains: input.transactionId }
                : undefined,
              paymentId: input.paymentId
                ? { contains: input.paymentId }
                : undefined,
              status: input.status,
              method: input.method,
            },
          }
        : undefined;

      const [count, payments] = await ctx.prisma.$transaction([
        ctx.prisma.payment.count({ where }),
        ctx.prisma.payment.findMany({
          where,
          orderBy,
          skip: input.page * input.size,
          take: input.size,
          include: {
            subscription: {
              select: {
                user: { select: { id: true, email: true } },
              },
            },
          },
        }),
      ]);
      return { count, payments };
    },
  })
  .query("get", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input },
        include: {
          subscription: {
            select: {
              phoneNumber: true,
              user: { select: { id: true, email: true } },
            },
          },
        },
      });
      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found!",
        });
      }
      return payment;
    },
  })
  .mutation("update-status", {
    input: z.object({
      id: z.string(),
      status: z.nativeEnum(PAYMENT_STATUS),
    }),
    async resolve({ ctx, input }) {
      const payment = await ctx.prisma.payment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          approvedAt:
            input.status === PAYMENT_STATUS.SUCCESS ? new Date() : null,
        },
      });
      return payment;
    },
  });
