import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET!,
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

// GitHub username 캐시 (providerAccountId → login, rate limit 방지)
const githubLoginCache = new Map<string, { login: string; expiresAt: number }>();

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

  const accountId = account.providerAccountId;

  // 캐시 확인 (1시간 유효)
  const cached = githubLoginCache.get(accountId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.login === adminUsername;
  }

  const res = await fetch(`https://api.github.com/user/${accountId}`);
  if (!res.ok) {
    // API 실패 시 캐시된 값이 있으면 재사용
    if (cached) return cached.login === adminUsername;
    return false;
  }

  const githubUser = await res.json();
  githubLoginCache.set(accountId, {
    login: githubUser.login,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1시간
  });

  return githubUser.login === adminUsername;
}
