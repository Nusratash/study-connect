'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, Download, FileText } from 'lucide-react';
import clsx from 'clsx';
import { fileUrl } from '../../lib/api';
import { fileKind, shortDate } from '../../lib/format';
import type { Material } from '../../lib/types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function MaterialCard({
  material,
  bookmarked,
  onToggleBookmark,
  ownerActions,
}: {
  material: Material;
  bookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  ownerActions?: React.ReactNode;
}) {
  const [saved, setSaved] = useState(!!bookmarked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!onToggleBookmark || busy) return;
    setBusy(true);
    setSaved((s) => !s);
    try {
      await onToggleBookmark(material.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-hover group flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <Badge tone="brand">{material.category || 'General'}</Badge>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-subtle text-[9.5px] font-bold tracking-wide text-ink-3">
          {fileKind(material.fileUrl)}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 font-serif text-[16px] font-semibold leading-snug text-ink">{material.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-2">{material.description || 'No description provided.'}</p>

      {material.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {material.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[11px] text-ink-3">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={material.uploader?.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-ink">{material.uploader?.name || 'Unknown'}</p>
            <p className="text-[11px] text-ink-3">{shortDate(material.createdAt)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {ownerActions}
          {onToggleBookmark && (
            <button
              onClick={toggle}
              aria-label={saved ? 'Remove bookmark' : 'Save material'}
              className={clsx('flex h-8 w-8 items-center justify-center rounded-md hover:bg-subtle', saved ? 'text-brand' : 'text-ink-3')}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          )}
          <a
            href={fileUrl(material.fileUrl)}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-sm"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" /> Get
          </a>
        </div>
      </div>
    </div>
  );
}
