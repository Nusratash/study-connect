import { notFound } from 'next/navigation';
import { safeGet } from '../../../lib/server-api';
import PostDetailClient from '../../../components/community/PostDetailClient';
import type { Post } from '../../../lib/types';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { id: string } }) {
  const { data, failed } = await safeGet<Post>(`/posts/${params.id}`); // Axios: GET /posts/:id (SSR)
  if (failed || !data) notFound();
  return <PostDetailClient initialPost={data} />;
}
