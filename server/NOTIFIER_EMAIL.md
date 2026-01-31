Nodemailer / Notify Flow
========================

What it does
- Sends email notifications for new gov job posts discovered during scraping.
- Uses Gmail SMTP via nodemailer transporter.
- Called from `utils/runAutomatic.mjs` after scraping a category if new unique posts are found.

Key files
- `nodemailer/notify_mailer.mjs` — defines transporter and `sendNewPostsEmail`.
- `utils/runAutomatic.mjs` — scraping loop, calls `sendNewPostsEmail({ categoryUrl, newJobs })`.

Environment variables needed
- `EMAIL_USER` — Gmail address (sender).
- `GOOGLE_APP_PASSWORD` — 16-char Gmail App Password.
- `NOTIFY_TO` — recipient list (comma-separated allowed).

Mailer code summary (`nodemailer/notify_mailer.mjs`)
```js
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.GOOGLE_APP_PASSWORD },
});

export async function sendNewPostsEmail({ categoryUrl, newJobs }) {
  const subject = `New Govt Job Posts (${newJobs.length})`;
  const text =
    `Category: ${categoryUrl}\n\n` +
    newJobs.map((j, i) => `${i + 1}. ${j.title}\n${j.link}`).join("\n\n");

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFY_TO,
    subject,
    text,
  });
}
```

How it’s triggered (scrape flow)
1) `utils/runAutomatic.mjs` scrapes categories and jobs.
2) Detects `newJobs` by comparing with stored jobs per category.
3) If `newJobs.length > 0`, calls `sendNewPostsEmail({ categoryUrl, newJobs })`.

Using it from Next.js
- Add API route or server action that calls `sendNewPostsEmail` directly.
- Ensure the same env vars are set in Next.js runtime.
- Minimal example (Next.js /pages/api/notify.js):
```js
import { sendNewPostsEmail } from "../../server/nodemailer/notify_mailer.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { categoryUrl, newJobs } = req.body;
  if (!categoryUrl || !Array.isArray(newJobs)) {
    return res.status(400).json({ error: "categoryUrl and newJobs required" });
  }
  try {
    await sendNewPostsEmail({ categoryUrl, newJobs });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

Testing locally
- Set env vars, run `node nodemailer/notify_mailer.mjs` with a small harness or trigger a scrape that yields new jobs.
- Gmail requires App Password (2FA on). Regular password won’t work.

Common issues
- 535 auth error: wrong app password or Gmail security not set.
- No email sent: `newJobs` empty or NOTIFY_TO missing.
- Rate limits: keep batch small; current mail is plain text, one email per scrape with only new jobs.
