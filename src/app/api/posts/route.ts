import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  if (all) {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, tags: true },
    });
    return NextResponse.json(posts);
  }

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 0;
  const q = searchParams.get("q");
  const category = searchParams.get("category");

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

  if (limit > 0) {
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, tags: true },
      }),
      prisma.post.count({ where }),
    ]);
    return NextResponse.json({ posts, totalCount });
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, tags: true },
  });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, excerpt, thumbnail, categoryId, tags, published } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  let slug = slugify(title);

  // Ensure unique slug
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      thumbnail: thumbnail || null,
      published: published ?? false,
      categoryId: categoryId ? Number(categoryId) : null,
      tags: {
        connectOrCreate: (tags || []).map((tag: string) => ({
          where: { name: tag },
          create: { name: tag },
        })),
      },
    },
    include: { category: true, tags: true },
  });

  return NextResponse.json(post, { status: 201 });
}
