import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGithubId: !!process.env.GITHUB_ID,
    hasAuthGithubId: !!process.env.AUTH_GITHUB_ID,
    hasGithubSecret: !!process.env.GITHUB_SECRET,
    hasAuthGithubSecret: !!process.env.AUTH_GITHUB_SECRET,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextauthUrl: !!process.env.NEXTAUTH_URL,
    hasTrustHost: !!process.env.AUTH_TRUST_HOST,
    githubIdPrefix: (process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID || "").slice(0, 6),
  });
}
