import { Bookmark, Download } from 'lucide-react';

export default function MaterialCard({
  material,
  onBookmark,
}: {
  material: any;
  onBookmark?: (id: string) => void;
}) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '');
  const fileHref = material.fileUrl ? `${base}${material.fileUrl}` : '#';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-slate-100 dark:border-slate-800 flex flex-col">
      <span className="self-start text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-700/30 dark:text-brand-300">
        {material.category || 'General'}
      </span>
      <h3 className="font-semibold text-lg mt-3">{material.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">{material.description}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-slate-400">by {material.uploader?.name || 'Unknown'}</span>
        <div className="flex gap-2">
          {onBookmark && (
            <button onClick={() => onBookmark(material.id)} aria-label="Save material" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
              <Bookmark className="w-4 h-4" />
            </button>
          )}
          <a href={fileHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">
            <Download className="w-4 h-4" /> Get
          </a>
        </div>
      </div>
    </div>
  );
}
