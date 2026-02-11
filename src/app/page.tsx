import { prisma } from "@/lib/prisma";
import PostList from "@/components/posts/PostList";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      category: true,
      tags: true,
    },
  });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: { where: { published: true } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Tech Blog</h1>
        <p className="text-gray-500">
          공부 기록과 개발 경험을 공유합니다.
        </p>
      </section>

      {categories.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {cat.name}
                <span className="ml-1 text-gray-400">
                  {cat._count.posts}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">최신 글</h2>
        <PostList posts={posts} />
      </section>
    </div>
  );
}
