'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { validateMaterial, Errors } from '../lib/validation';
import MaterialCard from './MaterialCard';
import FormField, { inputClass } from './FormField';

export default function MaterialsClient({ initialMaterials }: { initialMaterials: any[] }) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', file: null as File | null });
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const first = useRef(true);

  async function load(q: string) {
    const { data } = await api.get('/materials', { params: { search: q } }); // AXIOS GET (CSR search)
    setMaterials(data);
  }

  useEffect(() => {
    if (first.current) { first.current = false; return; } // first render already SSR'd
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const v = validateMaterial(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('file', form.file as File);
      await api.post('/materials', fd); // AXIOS POST (multipart)
      setShowUpload(false);
      setForm({ title: '', description: '', category: '', file: null });
      load(search);
    } catch (err: any) {
      setNotice(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function bookmark(id: string) {
    try {
      await api.post(`/bookmarks/${id}`); // AXIOS POST (many-to-many)
      setNotice('Saved to your bookmarks');
    } catch (err: any) {
      setNotice(err?.response?.data?.message || 'Please log in to save materials');
    }
    setTimeout(() => setNotice(''), 2500);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course Materials</h1>
          <p className="text-sm text-slate-500">Browse, search and share study resources</p>
        </div>
        <div className="flex gap-2">
          <input placeholder="Search materials…" value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass + ' md:w-64'} />
          <button onClick={() => setShowUpload((s) => !s)} className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium whitespace-nowrap hover:bg-brand-700">+ Upload</button>
        </div>
      </div>

      {notice && <div className="mb-4 text-sm bg-brand-50 text-brand-700 rounded-xl px-4 py-2">{notice}</div>}

      {showUpload && (
        <form onSubmit={handleUpload} noValidate className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800 grid md:grid-cols-2 gap-4">
          <FormField label="Title" error={errors.title}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Category">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description">
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </FormField>
          </div>
          <FormField label="File (max 25MB)" error={errors.file}>
            <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="text-sm" />
          </FormField>
          <div className="flex items-end">
            <button type="submit" disabled={uploading} className="px-5 py-2.5 rounded-xl bg-accent-500 text-white font-medium disabled:opacity-60">
              {uploading ? 'Uploading…' : 'Publish material'}
            </button>
          </div>
        </form>
      )}

      {materials.length === 0 ? (
        <p className="text-slate-500">No materials found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => <MaterialCard key={m.id} material={m} onBookmark={bookmark} />)}
        </div>
      )}
    </div>
  );
}
