import Link from 'next/link';
import { FileText } from 'lucide-react';
import { fileKind, shortDate } from '../../lib/format';
import type { Material } from '../../lib/types';

export default function MaterialRow({ material, action }: { material: Material; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-subtle text-ink-3">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-ink">{material.title}</p>
        <p className="text-[11.5px] text-ink-3">{material.category || 'General'} · {fileKind(material.fileUrl)} · {shortDate(material.createdAt)}</p>
      </div>
      {action}
    </div>
  );
}
