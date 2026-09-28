import { serverApi } from '../../lib/server-api';
import CommunityClient from '../../components/CommunityClient';

export const dynamic = 'force-dynamic';

// SSR: posts list rendered on the server.
export default async function CommunityPage() {
  let posts: any[] = [];
  try {
    const { data } = await serverApi.get('/posts'); // AXIOS GET (SSR)
    posts = data;
  } catch {}
  return <CommunityClient initialPosts={posts} />;
}
