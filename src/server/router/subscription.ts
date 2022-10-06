import { PAYMENT_METHOD, PAYMENT_STATUS, PLAN } from "@prisma/client";
import { z } from "zod";
import add from "date-fns/add";
import { createProtectedRouter } from "./protected-router";

export const subscriptionRouter = createProtectedRouter()
  .query("get", {
    async resolve({ ctx }) {
      const subscription = await ctx.prisma.subscription.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          id: true,
          phoneNumber: true,
          payments: {
            where: { NOT: { status: PAYMENT_STATUS.FAILED } },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              status: true,
              createdAt: true,
              approvedAt: true,
              plan: true,
            },
          },
        },
      });
      if (!subscription) {
        return null;
      }
      const lastPayment = subscription.payments[0];
      if (!lastPayment) {
        return {
          id: subscription.id,
          phoneNumber: subscription.phoneNumber,
          status: "inactive",
        };
      }

      const lastPaymentApprovedAt = lastPayment.approvedAt?.getTime() ?? 0;

      if (
        !lastPaymentApprovedAt ||
        lastPayment.status === PAYMENT_STATUS.PENDING
      ) {
        return {
          id: subscription.id,
          phoneNumber: subscription.phoneNumber,
          status: "pending",
        };
      }
      let durationInDays = 0;
      switch (lastPayment.plan) {
        case PLAN.MONTHLY:
          durationInDays = 30;
          break;
        case PLAN.QUARTERLY:
          durationInDays = 90;
          break;
      }
      const expiresAt = add(lastPaymentApprovedAt, { days: durationInDays });
      if (expiresAt.getTime() < Date.now()) {
        return {
          id: subscription.id,
          phoneNumber: subscription.phoneNumber,
          status: "expired",
        };
      }
      return {
        id: subscription.id,
        phoneNumber: subscription.phoneNumber,
        status: "active",
      };
    },
  })
  .mutation("create", {
    input: z.object({
      phoneNumber: z.string().min(10).max(14),
      method: z.nativeEnum(PAYMENT_METHOD),
      paymentId: z.string().min(10).max(14),
      transactionId: z.string().min(10),
    }),
    async resolve({ ctx, input }) {
      const { phoneNumber, paymentId, method, transactionId } = input;
      const data = {
        phoneNumber,
        payments: {
          create: {
            paymentId,
            method,
            transactionId,
          },
        },
      };
      const existingSubscription = await ctx.prisma.subscription.findUnique({
        where: { userId: ctx.session.user.id },
      });
      if (existingSubscription) {
        return await ctx.prisma.subscription.update({
          where: { userId: ctx.session.user.id },
          data,
        });
      }
      const subscription = await ctx.prisma.subscription.create({
        data: {
          ...data,
          userId: ctx.session.user.id,
        },
      });
      return subscription;
    },
  });
