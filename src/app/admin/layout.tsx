import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
        <p className="text-gray-500 mb-6">관리자만 접근할 수 있는 페이지입니다.</p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="text-sm text-blue-600 hover:underline">
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-6 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Admin
        </span>
        <Link
          href="/admin"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground"
        >
          대시보드
        </Link>
        <Link
          href="/admin/posts"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground"
        >
          글 관리
        </Link>
        <Link
          href="/admin/categories"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground"
        >
          카테고리
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">{session.user?.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-xs text-gray-500 hover:text-foreground">
              로그아웃
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
