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
    <div className={clsx('mb-3 flex flex-col', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && senderName && <span className="mb-1 ml-1 text-[11px] text-ink-3">{senderName}</span>}
      <div
        className={clsx(
          'max-w-[78%] whitespace-pre-wrap rounded-lg px-3.5 py-2 text-[13.5px] leading-relaxed',
          isOwn ? 'rounded-br-sm bg-brand text-on-brand' : 'rounded-bl-sm bg-subtle text-ink',
        )}
      >
        {content}
      </div>
      {time && <span className="mt-1 text-[10.5px] text-ink-3">{time}</span>}
    </div>
  );
}
