import Link from "next/link";
import { formatDate } from "@/lib/utils";
import TagLink from "./TagLink";
import HiddenTagsToggle from "./HiddenTagsToggle";

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
    <article className="group/card relative py-4 h-[140px] flex flex-col justify-center">
      {/* 클릭 가능한 포스트 링크 영역 */}
      <Link href={`/posts/${post.slug}`} className="block">
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

        {/* 제목 - overflow-visible wrapper로 툴팁 표시 */}
        <div className="relative overflow-visible mb-1 group/title">
          <h2 className="text-lg font-semibold group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors truncate">
            {post.title}
          </h2>
          <span className="invisible group-hover/title:visible absolute left-0 top-full mt-1 z-20 max-w-md px-3 py-2 text-sm font-normal text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-normal pointer-events-none">
            {post.title}
          </span>
        </div>

        {/* 요약 - overflow-visible wrapper로 툴팁 표시 */}
        <div className="relative overflow-visible group/excerpt">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate h-5">
            {post.excerpt || "\u00A0"}
          </p>
          {post.excerpt && (
            <span className="invisible group-hover/excerpt:visible absolute left-0 top-full mt-1 z-20 max-w-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-normal pointer-events-none">
              {post.excerpt}
            </span>
          )}
        </div>
      </Link>

      {/* 태그 - Link 밖에서 독립 클릭 */}
      <div className="flex items-center gap-2 mt-1.5 h-5">
        {visibleTags.map((tag) => (
          <TagLink key={tag.name} name={tag.name} />
        ))}
        {hiddenCount > 0 && (
          <HiddenTagsToggle tags={hiddenTags} />
        )}
      </div>
    </article>
  );
}
