import { safeGet } from '../../lib/server-api';
import CommunityBoard from '../../components/community/CommunityBoard';
import type { Post } from '../../lib/types';

export const dynamic = 'force-dynamic';

// SSR: posts list rendered on the server.
export default async function CommunityPage() {
  const { data, failed } = await safeGet<Post[]>('/posts'); // Axios: GET /posts (SSR)
  return <CommunityBoard initialPosts={data || []} initialFailed={failed} />;
}
