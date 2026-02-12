import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaginatedPostList from "@/components/posts/PaginatedPostList";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 5;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "카테고리를 찾을 수 없습니다" };
  return { title: `${category.name} 카테고리` };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const where = { published: true, categoryId: category.id };

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      include: {
        category: true,
        tags: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {totalCount}개의 글
      </p>
      <PaginatedPostList
        initialPosts={posts}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        basePath={`/categories/${slug}`}
        apiUrl={`/api/posts?limit=${POSTS_PER_PAGE}&category=${slug}`}
      />
    </div>
  );
}
