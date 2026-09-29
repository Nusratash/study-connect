// Dependency-free form validation. Each validator returns { field: message }.
export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v: string) => EMAIL_RE.test(v.trim());

export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (p: string) => /[A-Za-z]/.test(p) },
  { id: 'number', label: 'Contains a number', test: (p: string) => /\d/.test(p) },
];

export const passwordScore = (p: string) => passwordRules.filter((r) => r.test(p)).length;

export function validateLogin(f: { email: string; password: string }): Errors {
  const e: Errors = {};
  if (!f.email.trim()) e.email = 'Enter your email address.';
  else if (!isEmail(f.email)) e.email = 'That email address does not look right.';
  if (!f.password) e.password = 'Enter your password.';
  return e;
}

export function validateRegister(f: { name: string; email: string; password: string }): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (!isEmail(f.email)) e.email = 'That email address does not look right.';
  if (passwordScore(f.password) < passwordRules.length) e.password = 'Password does not meet the requirements yet.';
  return e;
}

export function validateMaterial(f: { title: string; file: File | null }, editing = false): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 3) e.title = 'Give the material a title (3+ characters).';
  if (!editing) {
    if (!f.file) e.file = 'Choose a file to upload.';
    else if (f.file.size > 25 * 1024 * 1024) e.file = 'The file must be smaller than 25 MB.';
  }
  return e;
}

export function validatePost(f: { title: string; content: string }): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 8) e.title = 'Write a specific title (8+ characters).';
  if (f.content.trim().length < 20) e.content = 'Add some detail so people can help (20+ characters).';
  return e;
}

export function validateText(value: string, min: number, message: string): string | undefined {
  return value.trim().length < min ? message : undefined;
}

export function validatePasswordChange(f: { current: string; next: string; confirm: string }): Errors {
  const e: Errors = {};
  if (!f.current) e.current = 'Enter your current password.';
  if (passwordScore(f.next) < passwordRules.length) e.next = 'New password does not meet the requirements.';
  if (f.next !== f.confirm) e.confirm = 'Passwords do not match.';
  return e;
}
