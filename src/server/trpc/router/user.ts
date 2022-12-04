import { PAYMENT_METHOD, PAYMENT_STATUS, PLAN } from "@prisma/client";
import { z } from "zod";
import add from "date-fns/add";
import { router, protectedProcedure, withProfileProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  createProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string(),
        phone: z.string(),
        institute: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findFirst({
        where: { user: { id: ctx.session.user.id } },
      });
      if (profile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Profile already exists",
        });
      }
      return await ctx.prisma.profile.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          fullName: input.fullName,
          phone: input.phone,
          institute: input.institute,
        },
      });
    }),
  updateProfile: withProfileProcedure
    .input(
      z.object({
        fullName: z.string().min(4),
        phone: z
          .string()
          .min(11)
          .max(15)
          .regex(/^[0-9]+$/),
        institute: z.string().min(4),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.profile.update({
        where: { id: ctx.session.user.profileId },
        data: {
          fullName: input.fullName,
          phone: input.phone,
          institute: input.institute,
        },
      });
    }),
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { profile: { include: { payments: true } } },
    });
  }),
  makePayment: withProfileProcedure
    .input(
      z.object({
        plan: z.nativeEnum(PLAN),
        paymentId: z.string(),
        transactionId: z.string(),
        method: z.nativeEnum(PAYMENT_METHOD),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.create({
        data: {
          profileId: ctx.session.user.profileId,
          plan: input.plan,
          paymentId: input.paymentId,
          transactionId: input.transactionId,
          method: input.method,
          status: PAYMENT_STATUS.PENDING,
        },
      });
      return payment;
    }),
  subscriptionStatus: withProfileProcedure.query(async ({ ctx }) => {
    const payments = await ctx.prisma.payment.findMany({
      where: {
        profileId: ctx.session.user.profileId,
        NOT: { status: PAYMENT_STATUS.FAILED },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
      select: {
        id: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        plan: true,
      },
    });
    const lastPayment = payments[0];
    if (!lastPayment) {
      return "inactive";
    }
    const lastPaymentApprovedAt = lastPayment.approvedAt?.getTime() ?? 0;
    if (
      !lastPaymentApprovedAt ||
      lastPayment.status === PAYMENT_STATUS.PENDING
    ) {
      return "pending";
    }
    let durationInDays: number;
    switch (lastPayment.plan) {
      case PLAN.MONTHLY:
        durationInDays = 30;
        break;
      case PLAN.QUARTERLY:
        durationInDays = 90;
        break;
      default:
        durationInDays = 0;
    }
    const expiresAt = add(lastPaymentApprovedAt, { days: durationInDays });
    if (expiresAt.getTime() < Date.now()) {
      return "expired";
    }
    return "active";
  }),
});
