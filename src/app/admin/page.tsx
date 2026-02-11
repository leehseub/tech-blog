import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalPosts, publishedPosts, draftPosts, totalCategories] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
      prisma.category.count(),
    ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "전체 글", value: totalPosts },
          { label: "발행됨", value: publishedPosts },
          { label: "임시저장", value: draftPosts },
          { label: "카테고리", value: totalCategories },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">최근 글</h2>
        <Link
          href="/admin/posts/new"
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 글 작성
        </Link>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="text-left px-4 py-3 font-medium">제목</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">카테고리</th>
              <th className="text-left px-4 py-3 font-medium">상태</th>
              <th className="text-right px-4 py-3 font-medium">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentPosts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">{post.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {post.category?.name || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {post.published ? "발행" : "임시저장"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
            {recentPosts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  아직 작성된 글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
