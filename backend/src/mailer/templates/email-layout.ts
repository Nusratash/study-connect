export const emailLayout = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${title}</title></head>
<body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; padding:24px; margin:0;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h2 style="color:#4f46e5;margin-top:0;">EduConnect</h2>
    ${bodyHtml}
    <p style="color:#94a3b8;font-size:12px;margin-top:32px;">You're receiving this because you have an EduConnect account.</p>
  </div>
</body>
</html>`;
