import { serverApi } from '../../lib/server-api';
import MaterialsClient from '../../components/MaterialsClient';

export const dynamic = 'force-dynamic';

// SSR: the material list is fetched on the server so it is in the first HTML.
export default async function MaterialsPage() {
  let materials: any[] = [];
  try {
    const { data } = await serverApi.get('/materials'); // AXIOS GET (SSR)
    materials = data;
  } catch {}
  return <MaterialsClient initialMaterials={materials} />;
}
