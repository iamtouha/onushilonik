import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
import { PAYMENT_METHOD, PAYMENT_STATUS, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const paymentsAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
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
      })
    )
    .query(async ({ ctx, input }) => {
      const { email, transactionId, paymentId, status, method, sortBy } = input;
      const needFilter =
        email || transactionId || paymentId || status || method;
      const params: Prisma.PaymentFindManyArgs = {
        where: needFilter
          ? {
              AND: {
                profile: {
                  user: { email: email ? { contains: email } : undefined },
                },
                transactionId: transactionId
                  ? { contains: transactionId }
                  : undefined,
                paymentId: paymentId ? { contains: paymentId } : undefined,
                status,
                method,
              },
            }
          : undefined,
        orderBy: sortBy
          ? { [sortBy]: input.sortDesc ? "desc" : "asc" }
          : undefined,
        skip: input.page * input.size,
        take: input.size,
      };

      const [count, payments] = await ctx.prisma.$transaction([
        ctx.prisma.payment.count({ where: params.where }),
        ctx.prisma.payment.findMany({
          ...params,
          include: {
            profile: {
              select: {
                fullName: true,
                user: { select: { id: true, email: true } },
              },
            },
          },
        }),
      ]);
      return { count, payments };
    }),
  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.payment.findUnique({
      where: { id: input },
      include: {
        profile: {
          select: {
            fullName: true,
            phone: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
    if (!item) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No Payment found with this ID",
      });
    }
    return item;
  }),
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(PAYMENT_STATUS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.update({
        where: { id: input.id },
        data: {
          status: input.status,
          approvedAt:
            input.status === PAYMENT_STATUS.SUCCESS ? new Date() : null,
        },
      });
      return payment;
    }),
});
