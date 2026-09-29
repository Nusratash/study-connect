import { safeGet } from '../../lib/server-api';
import MaterialsBoard from '../../components/materials/MaterialsBoard';
import type { Material } from '../../lib/types';

export const dynamic = 'force-dynamic';

// SSR: the first page of materials is fetched on the server (in the initial HTML).
export default async function MaterialsPage() {
  const { data, failed } = await safeGet<Material[]>('/materials'); // Axios: GET /materials (SSR)
  return <MaterialsBoard initialMaterials={data || []} initialFailed={failed} />;
}
