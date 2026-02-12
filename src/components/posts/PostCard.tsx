import Link from "next/link";
import { formatDate } from "@/lib/utils";

const MAX_VISIBLE_TAGS = 5;

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
    <article className="group/card relative">
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

        {/* 제목 - 1줄, 넘치면 말줄임 + 커스텀 툴팁 */}
        <h2 className="text-lg font-semibold group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors mb-1 truncate group/title relative">
          {post.title}
          <span className="invisible group-hover/title:visible absolute left-0 top-full mt-1 z-20 max-w-md px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-normal pointer-events-none">
            {post.title}
          </span>
        </h2>

        {/* 요약 - 1줄, 넘치면 말줄임 + 커스텀 툴팁 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate h-5 group/excerpt relative">
          {post.excerpt || "\u00A0"}
          {post.excerpt && (
            <span className="invisible group-hover/excerpt:visible absolute left-0 top-full mt-1 z-20 max-w-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-normal pointer-events-none">
              {post.excerpt}
            </span>
          )}
        </p>

        {/* 태그 - 최대 5개 + "+N" 호버 시 커스텀 툴팁 */}
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
            <span className="text-xs text-gray-400 dark:text-gray-500 cursor-default group/more relative">
              +{hiddenCount}
              <span className="invisible group-hover/more:visible absolute left-0 bottom-full mb-1 z-20 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                {hiddenTags.map((t) => `#${t.name}`).join("  ")}
              </span>
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
