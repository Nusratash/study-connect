import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns';

export function timeAgo(date: string | Date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 45_000) return 'just now';
  return `${formatDistanceToNowStrict(d)} ago`;
}

export const shortDate = (date: string | Date) => format(new Date(date), 'd MMM yyyy');

/** "14:32", "Yesterday", or "12 Mar" - used in chat lists. */
export function chatTime(date: string | Date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'd MMM');
}

export function initials(name = '') {
  const parts = name.replace(/^(dr|prof)\.?\s+/i, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function fileKind(path?: string | null): string {
  const ext = (path?.split('.').pop() ?? '').toLowerCase();
  const map: Record<string, string> = {
    pdf: 'PDF', doc: 'DOC', docx: 'DOC', ppt: 'PPT', pptx: 'PPT', xls: 'XLS', xlsx: 'XLS',
    txt: 'TXT', md: 'MD', zip: 'ZIP', png: 'IMG', jpg: 'IMG', jpeg: 'IMG',
  };
  return map[ext] ?? (ext ? ext.toUpperCase().slice(0, 4) : 'FILE');
}

export const splitList = (value: string) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

export const pluralise = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
