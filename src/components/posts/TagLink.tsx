"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function TagLink({ name }: { name: string }) {
  const searchParams = useSearchParams();
  const currentTags =
    searchParams.get("tags")?.split(",").filter(Boolean) || [];

  // 이미 선택된 태그면 중복 추가하지 않음
  const newTags = currentTags.includes(name)
    ? currentTags
    : [...currentTags, name];

  const params = new URLSearchParams(searchParams.toString());
  params.set("tags", newTags.join(","));
  params.delete("page");

  return (
    <Link
      href={`/posts?${params.toString()}`}
      className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      #{name}
    </Link>
  );
}
