import "server-only";

import { Resend } from "resend";

/**
 * Resend-backed transactional mailer.
 *
 * Configuration (all read from process.env):
 *   RESEND_API_KEY    — required. Obtain from https://resend.com/api-keys.
 *   RESEND_FROM       — required. Verified sender, e.g. "Portfolio <no-reply@yourdomain.com>".
 *                       During development you can use "onboarding@resend.dev".
 *   CONTACT_TO_EMAIL  — where contact-form notifications are delivered.
 *                       Defaults to khatrikrissna11@gmail.com.
 *
 * Fails "soft": if env vars are missing or the API call throws, we log and
 * return `{ ok: false }` so the caller (the contact route) can still save the
 * message to the DB and return success to the visitor.
 */

const CONTACT_TO_EMAIL_DEFAULT = "khatrikrissna11@gmail.com";

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface ContactNotificationInput {
  name: string;
  email: string;
  message: string;
  socials?: { platform: string; value: string }[];
  ip?: string | null;
  userAgent?: string | null;
  submittedAt?: Date;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSocialsHtml(
  socials: { platform: string; value: string }[]
): string {
  const rows = socials
    .filter((s) => (s.platform || s.value)?.toString().trim() !== "")
    .map(
      (s) =>
        `<li><strong>${escapeHtml(s.platform || "—")}:</strong> ${escapeHtml(
          s.value || ""
        )}</li>`
    )
    .join("");
  return rows ? `<ul style="margin:0;padding-left:18px">${rows}</ul>` : "";
}

function renderSocialsText(
  socials: { platform: string; value: string }[]
): string {
  return socials
    .filter((s) => (s.platform || s.value)?.toString().trim() !== "")
    .map((s) => `- ${s.platform || "—"}: ${s.value || ""}`)
    .join("\n");
}

/**
 * Send a "new contact form message" notification to the site owner.
 * Never throws — returns a `SendResult` describing outcome.
 */
export async function sendContactNotification(
  input: ContactNotificationInput
): Promise<SendResult> {
  const client = getClient();
  const from = process.env.RESEND_FROM?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || CONTACT_TO_EMAIL_DEFAULT;

  if (!client) {
    console.warn(
      "[mailer] RESEND_API_KEY missing; skipping contact notification email"
    );
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  if (!from) {
    console.warn(
      "[mailer] RESEND_FROM missing; skipping contact notification email"
    );
    return { ok: false, error: "RESEND_FROM not configured" };
  }

  const socials = input.socials ?? [];
  const submittedAt = input.submittedAt ?? new Date();

  const subject = `New contact message from ${input.name}`;

  const socialsHtml = renderSocialsHtml(socials);
  const socialsText = renderSocialsText(socials);

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
      <h2 style="margin:0 0 12px 0;font-size:20px">New contact form submission</h2>
      <p style="margin:0 0 20px 0;color:#555;font-size:13px">${escapeHtml(
        submittedAt.toUTCString()
      )}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:8px 0;color:#666;width:110px">Name</td>
          <td style="padding:8px 0">${escapeHtml(input.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666">Email</td>
          <td style="padding:8px 0"><a href="mailto:${escapeHtml(
            input.email
          )}">${escapeHtml(input.email)}</a></td>
        </tr>
        ${
          socialsHtml
            ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">Socials</td><td style="padding:8px 0">${socialsHtml}</td></tr>`
            : ""
        }
      </table>

      <h3 style="margin:20px 0 8px 0;font-size:15px">Message</h3>
      <div style="white-space:pre-wrap;border-left:3px solid #ddd;padding:8px 12px;background:#fafafa;font-size:14px;line-height:1.5">${escapeHtml(
        input.message
      )}</div>

      ${
        input.ip || input.userAgent
          ? `<p style="margin-top:24px;font-size:11px;color:#888">IP: ${escapeHtml(
              input.ip || "—"
            )} · UA: ${escapeHtml(input.userAgent || "—")}</p>`
          : ""
      }
    </div>
  `;

  const text = [
    `New contact form submission`,
    `Submitted: ${submittedAt.toUTCString()}`,
    ``,
    `Name:    ${input.name}`,
    `Email:   ${input.email}`,
    socialsText ? `Socials:\n${socialsText}` : "",
    ``,
    `Message:`,
    input.message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo: input.email,
    });
    if (error) {
      console.error("[mailer] Resend send error", error);
      return { ok: false, error: error.message || "Resend error" };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[mailer] Unexpected send error", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
