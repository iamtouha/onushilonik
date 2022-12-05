import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db/client";
import { env } from "@/env/server.mjs";
import { type USER_ROLE } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as USER_ROLE;
        session.user.active = user.active as boolean;
        session.user.profileId = user.profileId as string;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (!url.includes("/create-profile")) {
        return baseUrl + "/app";
      }
      return url;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      httpOptions: { timeout: 40000 },
    }),
  ],
  pages: {
    newUser: "/create-profile",
  },
  theme: {
    logo: "/img/logo.png",
    brandColor: "#ff9800",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
