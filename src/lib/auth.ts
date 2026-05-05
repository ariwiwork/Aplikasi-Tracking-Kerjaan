import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Auto-create admin if no users exist
        const count = await prisma.user.count();
        if (count === 0) {
          await prisma.user.create({
            data: {
              username: "admin",
              password: "password123", // Simple password for local
            }
          });
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (user && user.password === credentials.password) {
          return { id: user.id.toString(), name: user.username };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-local-key-for-tracking-app",
};
