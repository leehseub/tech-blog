import { prisma } from "@/lib/prisma";
import PostList from "@/components/posts/PostList";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "글 목록",
};

interface PostsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { q, category } = await searchParams;

  const where = {
    published: true,
    ...(q && {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
      ],
    }),
    ...(category && {
      category: { slug: category },
    }),
  };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      tags: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">글 목록</h1>

      {/* Search & Filter */}
      <div className="space-y-3 mb-8">
        <form action="/posts" method="GET">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="검색어를 입력하세요..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/posts"
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              !category
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/posts?category=${cat.slug}${q ? `&q=${q}` : ""}`}
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                category === cat.slug
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          &ldquo;{q}&rdquo; 검색 결과: {posts.length}건
        </p>
      )}

      <PostList posts={posts} />
    </div>
  );
}
