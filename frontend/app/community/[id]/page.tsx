import { notFound } from 'next/navigation';
import { serverApi } from '../../../lib/server-api';
import PostDetailClient from '../../../components/PostDetailClient';

export const dynamic = 'force-dynamic';

// Dynamic route + SSR. Unknown/invalid ids fall through to not-found.tsx
export default async function PostDetailPage({ params }: { params: { id: string } }) {
  let post: any;
  try {
    const { data } = await serverApi.get(`/posts/${params.id}`); // AXIOS GET (SSR)
    post = data;
  } catch {
    notFound();
  }
  return <PostDetailClient initialPost={post} />;
}
