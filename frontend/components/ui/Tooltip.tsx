'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function Tooltip({ label, children, side = 'top' }: { label: string; children: React.ReactNode; side?: 'top' | 'bottom' }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={clsx(
            'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-bg shadow-pop',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
