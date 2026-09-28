import clsx from 'clsx';

export default function ChatBubble({
  content,
  isOwn,
  senderName,
  time,
}: {
  content: string;
  isOwn: boolean;
  senderName?: string;
  time?: string;
}) {
  return (
    <div className={clsx('flex flex-col mb-3', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && senderName && (
        <span className="text-xs text-slate-400 mb-1 ml-1">{senderName}</span>
      )}
      <div
        className={clsx(
          'max-w-[75%] px-4 py-2 rounded-2xl text-sm',
          isOwn
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm',
        )}
      >
        {content}
      </div>
      {time && <span className="text-[10px] text-slate-400 mt-1">{time}</span>}
    </div>
  );
}
