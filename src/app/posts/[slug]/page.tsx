import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostContent from "@/components/posts/PostContent";
import TableOfContents from "@/components/posts/TableOfContents";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });

  if (!post) return { title: "글을 찾을 수 없습니다" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      tags: true,
    },
  });

  if (!post) notFound();

  // 같은 카테고리: 현재 글보다 최신 2개 + 현재 글 + 이전 2개
  const [newerPosts, olderPosts] = post.categoryId
    ? await Promise.all([
        prisma.post.findMany({
          where: {
            published: true,
            categoryId: post.categoryId,
            createdAt: { gt: post.createdAt },
          },
          orderBy: { createdAt: "asc" },
          take: 2,
          select: { slug: true, title: true, createdAt: true },
        }),
        prisma.post.findMany({
          where: {
            published: true,
            categoryId: post.categoryId,
            createdAt: { lt: post.createdAt },
          },
          orderBy: { createdAt: "desc" },
          take: 2,
          select: { slug: true, title: true, createdAt: true },
        }),
      ])
    : [[], []];

  // 최신순 정렬: newer(역순) → 현재 글 → older
  const categoryPosts = [
    ...newerPosts.reverse(),
    { slug: post.slug, title: post.title, createdAt: post.createdAt, isCurrent: true as const },
    ...olderPosts,
  ];

  return (
    <div className="relative">
    <article className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8 bg-gray-50 dark:bg-gray-900/50 -mx-4 px-4 py-6 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <span>&middot;</span>
          <time dateTime={post.createdAt.toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="text-sm px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      <PostContent content={post.content} />

      {categoryPosts.length > 1 && (
        <section className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4">
            같은 카테고리의 글
            <span className="ml-2 text-sm font-normal text-gray-500">
              {post.category!.name}
            </span>
          </h2>
          <ul className="space-y-2">
            {categoryPosts.map((item) => {
              const isCurrent = "isCurrent" in item;
              return (
                <li key={item.slug}>
                  {isCurrent ? (
                    <div className="flex items-baseline gap-3 px-2 py-1 -mx-2 rounded bg-blue-50 dark:bg-blue-900/20">
                      <span className="text-sm text-blue-500 dark:text-blue-400 shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {item.title}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/posts/${item.slug}`}
                      className="flex items-baseline gap-3 group"
                    >
                      <span className="text-sm text-gray-400 shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/posts"
          className="text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          &larr; 글 목록으로 돌아가기
        </Link>
      </footer>
    </article>

    {/* 우측 TOC — 본문 우측 바깥에 fixed 배치, 스크롤 따라감 */}
    <aside className="hidden xl:block fixed top-24 w-56" style={{ left: "calc(50% + 31rem)" }}>
      <TableOfContents content={post.content} />
    </aside>
    </div>
  );
}
