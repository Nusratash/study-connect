import { GraduationCap } from 'lucide-react';
import { safeGet } from '../../lib/server-api';
import type { User } from '../../lib/types';
import ExpertsBoard from '../../components/experts/ExpertsBoard';

export const dynamic = 'force-dynamic';

export default async function ExpertsPage() {
  const { data, failed } = await safeGet<User[]>('/users/experts'); // Axios: GET /users/experts (SSR)
  return <ExpertsBoard initialExperts={data || []} initialFailed={failed} />;
}
