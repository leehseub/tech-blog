import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { category: true, tags: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content, excerpt, thumbnail, categoryId, tags, published } = body;

  const existingPost = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { tags: true },
  });

  if (!existingPost) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let slug = existingPost.slug;
  if (title && title !== existingPost.title) {
    slug = slugify(title);
    const duplicate = await prisma.post.findFirst({
      where: { slug, id: { not: Number(id) } },
    });
    if (duplicate) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: {
      ...(title && { title, slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt: excerpt || null }),
      ...(thumbnail !== undefined && { thumbnail: thumbnail || null }),
      ...(published !== undefined && { published }),
      ...(categoryId !== undefined && {
        categoryId: categoryId ? Number(categoryId) : null,
      }),
      ...(tags && {
        tags: {
          set: [],
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
    },
    include: { category: true, tags: true },
  });

  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.post.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
