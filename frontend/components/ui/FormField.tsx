import clsx from 'clsx';

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink-2">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12.5px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function inputClass(hasError?: boolean) {
  return clsx('input', hasError && 'border-danger focus:shadow-none');
}
