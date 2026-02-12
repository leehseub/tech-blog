import Link from "next/link";
import { formatDate } from "@/lib/utils";

const MAX_VISIBLE_TAGS = 3;

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    createdAt: Date;
    category: { name: string; slug: string } | null;
    tags: { name: string }[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = post.tags.slice(MAX_VISIBLE_TAGS);
  const hiddenCount = hiddenTags.length;

  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block py-4 h-[140px] flex flex-col justify-center">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
          {post.category && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {post.category.name}
            </span>
          )}
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>

        {/* 제목 - 1줄 고정, 넘치면 말줄임 + 호버 툴팁 */}
        <h2
          className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 truncate"
          title={post.title}
        >
          {post.title}
        </h2>

        {/* 요약 - 1줄 고정, 넘치면 말줄임 + 호버 툴팁 */}
        <p
          className="text-sm text-gray-600 dark:text-gray-400 truncate h-5"
          title={post.excerpt || undefined}
        >
          {post.excerpt || "\u00A0"}
        </p>

        {/* 태그 - 최대 3개 + 나머지 "+N" 호버 시 전체 표시 */}
        <div className="flex items-center gap-2 mt-1.5 h-5">
          {visibleTags.map((tag) => (
            <span
              key={tag.name}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              #{tag.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              className="text-xs text-gray-400 dark:text-gray-500 cursor-default"
              title={hiddenTags.map((t) => `#${t.name}`).join(" ")}
            >
              +{hiddenCount}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
