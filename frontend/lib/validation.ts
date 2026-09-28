// Simple, dependency-free frontend validation helpers.
export type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());

export function validateLogin(f: { email: string; password: string }): Errors {
  const e: Errors = {};
  if (!f.email.trim()) e.email = 'Email is required';
  else if (!isEmail(f.email)) e.email = 'Enter a valid email address';
  if (!f.password) e.password = 'Password is required';
  return e;
}

export function validateRegister(f: { name: string; email: string; password: string }): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!isEmail(f.email)) e.email = 'Enter a valid email address';
  if (f.password.length < 8) e.password = 'Password must be at least 8 characters';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    e.password = 'Password must contain letters and numbers';
  return e;
}

export function validateMaterial(f: { title: string; file: File | null }): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  if (!f.file) e.file = 'Please choose a file';
  else if (f.file.size > 25 * 1024 * 1024) e.file = 'File must be smaller than 25MB';
  return e;
}

export function validatePost(f: { title: string; content: string }): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
  if (f.content.trim().length < 10) e.content = 'Description must be at least 10 characters';
  return e;
}

export function validateMessage(text: string, min = 1): Errors {
  const e: Errors = {};
  if (text.trim().length < min) e.message = `Please enter at least ${min} characters`;
  return e;
}
