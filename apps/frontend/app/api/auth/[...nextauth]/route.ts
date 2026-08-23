import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prismaClient } from "db";

const handler = NextAuth({
    adapter: PrismaAdapter(prismaClient),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
    CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
        const response = await fetch("http://localhost:8080/signin",{
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
            })
        })
        if (!response.ok) {
            return null;
        }
        const user = await response.json();
        return user;
    }
    }),

    GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!
    })
    ],
})

export { handler as GET, handler as POST }