/**
 * E-mail to the agent about every new lead, sent through the Resend HTTP API.
 * The key and recipient come from the hosting environment (RESEND_API_KEY, LEAD_NOTIFY_EMAIL,
 * optional LEAD_NOTIFY_FROM) or, when those are not set, from Nastavení in the administration
 * (table notification_settings, never exposed publicly). Without both nothing is sent,
 * and a failure never blocks saving the lead.
 */
export type LeadNotice = {
  kind: "contact" | "valuation" | "property_inquiry";
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  property_slug?: string | null;
  property_type?: string | null;
  property_location?: string | null;
  property_size?: string | null;
};

const kindLabel: Record<LeadNotice["kind"], string> = {
  contact: "Zpráva z kontaktního formuláře",
  valuation: "Žádost o odhad ceny",
  property_inquiry: "Zájem o nemovitost",
};

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

/** Plain rows shown in the e-mail, in reading order; empty values are left out. */
export function leadRows(lead: LeadNotice, siteUrl: string): [string, string][] {
  const rows: [string, string | null | undefined][] = [
    ["Typ", kindLabel[lead.kind]],
    ["Jméno", lead.name],
    ["Telefon", lead.phone],
    ["E-mail", lead.email],
    ["Nemovitost", lead.property_slug ? `${siteUrl}/nabidka/${lead.property_slug}` : null],
    ["Typ nemovitosti", lead.property_type],
    ["Lokalita", lead.property_location],
    ["Plocha", lead.property_size],
    ["Zpráva", lead.message],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]?.trim()));
}

export type NotifyConfig = { key: string; to: string[]; from: string };
export type StoredNotifySettings = {
  notify_email?: string | null;
  resend_api_key?: string | null;
} | null;

const defaultFrom = "Web Petr Pavlát reality <onboarding@resend.dev>";

/** Environment wins over values saved in the administration. */
export function notifyConfig(stored: StoredNotifySettings): NotifyConfig | null {
  const key = (process.env["RESEND_API_KEY"] || stored?.resend_api_key || "").trim();
  const to = (process.env["LEAD_NOTIFY_EMAIL"] || stored?.notify_email || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (!key || !to.length) return null;
  return { key, to, from: process.env["LEAD_NOTIFY_FROM"] || defaultFrom };
}

function render(lead: LeadNotice, siteUrl: string, test: boolean) {
  const rows = leadRows(lead, siteUrl);
  const title = test ? "Zkušební upozornění z webu" : kindLabel[lead.kind];
  const subject = test
    ? title
    : `${title}: ${lead.name}${lead.property_location ? `, ${lead.property_location}` : ""}`;
  const text = [
    ...(test ? ["Takhle Vám budou chodit nové poptávky z webu.", ""] : []),
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Všechny poptávky: ${siteUrl}/admin`,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#292927;line-height:1.5">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#bd5c17">Nová poptávka z webu</p>
<h2 style="margin:0 0 16px;font-size:20px">${escape(title)}</h2>
${test ? '<p style="margin:0 0 12px">Takhle Vám budou chodit nové poptávky z webu.</p>' : ""}
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="color:#7a766f;vertical-align:top;padding-right:16px">${escape(label)}</td><td style="white-space:pre-wrap">${escape(value)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin-top:20px">${
    lead.phone
      ? `<a href="tel:${escape(lead.phone.replace(/\s+/g, ""))}" style="background:#bd5c17;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px">Zavolat</a>`
      : ""
  }<a href="${escape(siteUrl)}/admin" style="color:#bd5c17">Otevřít poptávky v administraci</a></p>
<p style="font-size:12px;color:#8a8780;margin-top:16px">Na tento e-mail můžete rovnou odpovědět – odpověď půjde zájemci.</p>
</div>`;
  return { subject, text, html };
}

/** Sends one e-mail; returns a readable Czech reason when Resend refuses it. */
export async function sendLeadEmail(
  config: NotifyConfig,
  lead: LeadNotice,
  siteUrl: string,
  test = false,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        reply_to: lead.email,
        ...render(lead, siteUrl, test),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return { ok: true };
    const detail = (await response.text()).slice(0, 300);
    if (response.status === 401 || (response.status === 400 && /api key/i.test(detail)))
      return { ok: false, error: "Resend odmítl klíč. Zkontrolujte, že je zkopírovaný celý." };
    if (/testing emails|own email address|verify a domain/i.test(detail))
      return {
        ok: false,
        error:
          "Resend zatím posílá jen na e-mail, kterým jste se v Resendu registroval. Zadejte ten, nebo v Resendu ověřte doménu.",
      };
    return { ok: false, error: `Resend vrátil chybu ${response.status}: ${detail}` };
  } catch (error) {
    return {
      ok: false,
      error: `E-mail se nepodařilo odeslat: ${error instanceof Error ? error.message : "neznámá chyba"}`,
    };
  }
}

export async function notifyNewLead(
  lead: LeadNotice,
  siteUrl: string,
  config: NotifyConfig | null,
): Promise<void> {
  if (!config) return;
  const result = await sendLeadEmail(config, lead, siteUrl);
  if (!result.ok) console.error("Lead notification failed:", result.error);
}
