/* eslint-disable turbo/no-undeclared-env-vars */

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prismaClient } from "db";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/signin",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "name@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${backendUrl}/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email.trim(),
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();

          if (!user || !user.id || !user.email) {
            return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          };
        } catch (error) {
          console.error("Credentials authorize connection error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: (process.env.AUTH_GOOGLE_ID || "")!,
      clientSecret: (process.env.AUTH_GOOGLE_SECRET || "")!,
      allowDangerousEmailAccountLinking: true,
    }),

    GitHubProvider({
      clientId: (process.env.AUTH_GITHUB_ID || "")!,
      clientSecret: (process.env.AUTH_GITHUB_SECRET || "")!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = (token.id || token.sub) as string;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };