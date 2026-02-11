import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;

  const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
  if (!adminUsername) return false;

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "github",
    },
  });

  if (!account) return false;

  const res = await fetch(`https://api.github.com/user/${account.providerAccountId}`);
  if (!res.ok) return false;

  const githubUser = await res.json();
  return githubUser.login === adminUsername;
}
