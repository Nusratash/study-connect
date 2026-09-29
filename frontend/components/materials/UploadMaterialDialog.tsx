'use client';

import { useState } from 'react';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { validateMaterial, Errors } from '../../lib/validation';
import { formatBytes } from '../../lib/format';
import FormField, { inputClass } from '../ui/FormField';
import { useToast } from '../../lib/toast';
import type { Material } from '../../lib/types';

export default function UploadMaterialDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (m: Material) => void }) {
  const { push } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '', file: null as File | null });
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
      const { data } = await api.post<Material>('/materials', fd); // Axios: POST /materials (multipart)
      push('success', 'Material published.');
      onCreated(data);
    } catch (err) {
      push('error', apiError(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]" role="dialog" aria-modal>
      <div className="max-h-[90vh] w-full max-w-lg animate-rise-in overflow-y-auto rounded-lg border border-line bg-surface p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">Share a material</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:bg-subtle">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Title" error={errors.title} required>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass(!!errors.title)} placeholder="e.g. Linear Algebra Cheat Sheet" />
          </FormField>
          <FormField label="Category">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass()} placeholder="Mathematics" />
          </FormField>
          <FormField label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass()} placeholder="What will people find in this file?" />
          </FormField>
          <FormField label="File" error={errors.file} hint="Max 25 MB" required>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line px-4 py-6 text-center hover:bg-subtle">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
              />
              {form.file ? (
                <span className="flex items-center gap-2 text-[13px] text-ink">
                  <FileIcon className="h-4 w-4 text-brand" /> {form.file.name} <span className="text-ink-3">({formatBytes(form.file.size)})</span>
                </span>
              ) : (
                <>
                  <UploadCloud className="mb-1.5 h-5 w-5 text-ink-3" />
                  <span className="text-[13px] text-ink-2">Click to choose a file</span>
                </>
              )}
            </label>
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Publishing…' : 'Publish material'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
