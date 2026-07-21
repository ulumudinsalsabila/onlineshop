import { env } from "@/lib/env";

type AuthEmail = { to: string; subject: string; heading: string; body: string; actionLabel: string; actionUrl: string };

export async function sendAuthEmail(message: AuthEmail) {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") console.info(`[development email] ${message.subject}: ${message.actionUrl}`);
    return { delivered: false as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1>${message.heading}</h1><p>${message.body}</p><p><a href="${message.actionUrl}">${message.actionLabel}</a></p><p>Link ini memiliki batas waktu dan hanya dapat digunakan satu kali.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected request: ${response.status}`);
  return { delivered: true as const };
}
