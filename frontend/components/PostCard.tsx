import Link from 'next/link';

export default function PostCard({ post }: { post: any }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="block bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2 flex-wrap">
          {(post.tags || []).slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-700/30 dark:text-brand-300">
              #{tag}
            </span>
          ))}
        </div>
        {post.status === 'resolved' ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-500">
            ✓ Resolved
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
            Open
          </span>
        )}
      </div>
      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{post.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{post.content}</p>
      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <span>by {post.author?.name || 'Unknown'}</span>
        <span>▲ {post.upvotes} upvotes</span>
      </div>
    </Link>
  );
}
