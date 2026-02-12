import { prisma } from "@/lib/prisma";
import PaginatedPostList from "@/components/posts/PaginatedPostList";
import PostsSearchBar from "@/components/posts/PostsSearchBar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 5;

export const metadata: Metadata = {
  title: "글 목록",
};

interface PostsPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string; tags?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { q, category, page, tags } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const tagList = tags ? tags.split(",").filter(Boolean) : [];

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
    ...(tagList.length > 0 && {
      AND: tagList.map((tag) => ({ tags: { some: { name: tag } } })),
    }),
  };

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

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const queryParams: Record<string, string> = {};
  if (q) queryParams.q = q;
  if (category) queryParams.category = category;
  if (tags) queryParams.tags = tags;

  const apiParams = new URLSearchParams({ limit: String(POSTS_PER_PAGE) });
  if (q) apiParams.set("q", q);
  if (category) apiParams.set("category", category);
  if (tags) apiParams.set("tags", tags);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">글 목록</h1>

      <PostsSearchBar
        categories={categories}
        initialQ={q || ""}
        initialCategory={category || ""}
        initialTags={tagList}
        totalCount={totalCount}
      />

      <PaginatedPostList
        initialPosts={posts}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        basePath="/posts"
        queryParams={queryParams}
        apiUrl={`/api/posts?${apiParams.toString()}`}
      />
    </div>
  );
}
