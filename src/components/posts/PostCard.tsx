import Link from "next/link";
import { formatDate } from "@/lib/utils";

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
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block py-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          {post.category && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {post.category.name}
            </span>
          )}
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>
        <h2 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-2">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
