import { PAYMENT_METHOD } from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const subscriptionRouter = createProtectedRouter()
  .query("get", {
    async resolve({ ctx }) {
      return await ctx.prisma.subscription.findUnique({
        where: { userId: ctx.session.user.id },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      phoneNumber: z.string().min(10).max(14),
      method: z.nativeEnum(PAYMENT_METHOD),
      paymentId: z.string().min(10).max(14),
      transactionId: z.string().min(10),
      amount: z.number().min(0),
    }),
    async resolve({ ctx, input }) {
      const { phoneNumber, paymentId, amount, method, transactionId } = input;
      const data = {
        phoneNumber,
        payments: {
          create: {
            paymentId,
            amount,
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
