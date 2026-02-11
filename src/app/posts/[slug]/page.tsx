import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostContent from "@/components/posts/PostContent";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      tags: true,
    },
  });

  if (!post) notFound();

  return (
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

      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/posts"
          className="text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          &larr; 글 목록으로 돌아가기
        </Link>
      </footer>
    </article>
  );
}
