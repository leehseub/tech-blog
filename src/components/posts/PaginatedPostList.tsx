"use client";

import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import Pagination from "./Pagination";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
  tags: { name: string }[];
}

interface PaginatedPostListProps {
  initialPosts: Post[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  queryParams?: Record<string, string>;
  apiUrl: string;
}

function buildPageHref(
  basePath: string,
  queryParams: Record<string, string>,
  page: number,
): string {
  const params = new URLSearchParams(queryParams);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export default function PaginatedPostList({
  initialPosts,
  currentPage,
  totalPages,
  totalCount,
  basePath,
  queryParams = {},
  apiUrl,
}: PaginatedPostListProps) {
  // 모바일 더보기용 state
  const [mobilePosts, setMobilePosts] = useState<Post[]>(initialPosts);
  const [nextPage, setNextPage] = useState(currentPage + 1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(currentPage > 1);

  // 모바일에서 ?page=2 등으로 접근 시, 1페이지부터 다시 로드
  useEffect(() => {
    if (currentPage <= 1) return;
    let cancelled = false;
    setInitialLoading(true);

    const loadFromStart = async () => {
      try {
        const separator = apiUrl.includes("?") ? "&" : "?";
        // 1페이지부터 현재 페이지까지의 글을 모두 가져오기
        const promises = [];
        for (let p = 1; p <= currentPage; p++) {
          promises.push(
            fetch(`${apiUrl}${separator}page=${p}`).then((r) => r.json()),
          );
        }
        const results = await Promise.all(promises);
        if (cancelled) return;
        const allPosts = results.flatMap((r) => r.posts);
        setMobilePosts(allPosts);
        setNextPage(currentPage + 1);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    loadFromStart();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allLoaded = mobilePosts.length >= totalCount;

  const loadMore = async () => {
    setLoading(true);
    try {
      const separator = apiUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${apiUrl}${separator}page=${nextPage}`);
      const data = await res.json();
      setMobilePosts((prev) => [...prev, ...data.posts]);
      setNextPage((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  if (initialPosts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* 데스크톱: 페이지 번호 방식 */}
      <div className="hidden md:block">
        <div className="divide-y divide-gray-100 dark:divide-gray-800 min-h-[600px]">
          {initialPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(p) => buildPageHref(basePath, queryParams, p)}
        />
      </div>

      {/* 모바일: 더보기 방식 */}
      <div className="md:hidden">
        {initialLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            로딩 중...
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {mobilePosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            {!allLoaded && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "로딩 중..." : "더보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
