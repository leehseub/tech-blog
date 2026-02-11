import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostList from "@/components/posts/PostList";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "카테고리를 찾을 수 없습니다" };
  return { title: `${category.name} 카테고리` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          tags: true,
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {category.posts.length}개의 글
      </p>
      <PostList posts={category.posts} />
    </div>
  );
}
