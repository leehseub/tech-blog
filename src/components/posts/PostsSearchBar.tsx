"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PostsSearchBarProps {
  categories: { name: string; slug: string }[];
  initialQ: string;
  initialCategory: string;
  initialTags: string[];
  totalCount: number;
}

export default function PostsSearchBar({
  categories,
  initialQ,
  initialCategory,
  initialTags,
  totalCount,
}: PostsSearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState<string[]>(initialTags);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = useCallback(
    (overrides: { q?: string; category?: string; tags?: string[] } = {}) => {
      const params = new URLSearchParams();
      const newQ = overrides.q ?? q;
      const newCat = overrides.category ?? category;
      const newTags = overrides.tags ?? tags;

      if (newQ) params.set("q", newQ);
      if (newCat) params.set("category", newCat);
      if (newTags.length > 0) params.set("tags", newTags.join(","));

      const qs = params.toString();
      return `/posts${qs ? `?${qs}` : ""}`;
    },
    [q, category, tags],
  );

  // Sync from URL changes (e.g. browser back/forward)
  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
    setTags(initialTags);
  }, [initialQ, initialCategory, initialTags]);

  const handleSearchChange = (value: string) => {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(buildUrl({ q: value }));
    }, 300);
  };

  const handleCategoryClick = (slug: string) => {
    const newCat = slug === category ? "" : slug;
    setCategory(newCat);
    router.replace(buildUrl({ category: newCat }));
  };

  const removeTag = (tagName: string) => {
    const newTags = tags.filter((t) => t !== tagName);
    setTags(newTags);
    router.replace(buildUrl({ tags: newTags }));
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-3 mb-8">
      {/* 검색 입력 */}
      <input
        type="text"
        value={q}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="검색어를 입력하세요..."
        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 카테고리 버튼 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleCategoryClick("")}
          className={`text-sm px-3 py-2 rounded-lg transition-colors ${
            !category
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              category === cat.slug
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 태그 chips */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                aria-label={`${tag} 태그 제거`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 검색 결과 수 */}
      {(q || tags.length > 0) && (
        <p className="text-sm text-gray-500">
          {q && <>&ldquo;{q}&rdquo; </>}
          {tags.length > 0 && (
            <>{tags.map((t) => `#${t}`).join(", ")} </>
          )}
          검색 결과: {totalCount}건
        </p>
      )}
    </div>
  );
}
