"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  category: { name: string } | null;
}

type SortKey = "createdAt" | "title";
type SortDir = "asc" | "desc";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 & 정렬 state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "published" | "draft">("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/api/posts?all=true")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const names = new Set<string>();
    posts.forEach((p) => {
      if (p.category?.name) names.add(p.category.name);
    });
    return Array.from(names).sort();
  }, [posts]);

  // 필터링 + 정렬
  const filtered = useMemo(() => {
    let result = posts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (categoryFilter) {
      result = result.filter((p) => p.category?.name === categoryFilter);
    }

    if (statusFilter === "published") {
      result = result.filter((p) => p.published);
    } else if (statusFilter === "draft") {
      result = result.filter((p) => !p.published);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        cmp = a.title.localeCompare(b.title, "ko");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [posts, search, categoryFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">글 관리</h1>
        <Link
          href="/admin/posts/new"
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 글 작성
        </Link>
      </div>

      {/* 필터 영역 */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목 검색..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "published" | "draft")}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 상태</option>
          <option value="published">발행</option>
          <option value="draft">임시저장</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-2">
        {filtered.length}개의 글
      </p>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-blue-600 transition-colors"
                onClick={() => toggleSort("title")}
              >
                제목{sortIndicator("title")}
              </th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">카테고리</th>
              <th
                className="text-left px-4 py-3 font-medium hidden md:table-cell cursor-pointer select-none hover:text-blue-600 transition-colors"
                onClick={() => toggleSort("createdAt")}
              >
                작성일{sortIndicator("createdAt")}
              </th>
              <th className="text-left px-4 py-3 font-medium">상태</th>
              <th className="text-right px-4 py-3 font-medium">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {post.category?.name || "-"}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {post.published ? "발행" : "임시저장"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {posts.length === 0
                    ? "아직 작성된 글이 없습니다."
                    : "검색 결과가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
