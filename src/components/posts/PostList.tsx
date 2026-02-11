import PostCard from "./PostCard";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
  tags: { name: string }[];
}

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>아직 작성된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
