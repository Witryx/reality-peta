import { z } from "zod";
import type { Database } from "./database.server";
import { audit } from "./properties.server";
import { HttpError } from "./security.server";
import { notifyConfig, type NotifyConfig, type StoredNotifySettings } from "./lead-notify.server";

/** Lead e-mail settings saved in the administration. The key never leaves the server. */
async function hasTable(db: Database) {
  const [row] = await db.query<{ table_name: string | null }>(
    "SELECT to_regclass('public.notification_settings')::text AS table_name",
  );
  return !!row?.table_name;
}

async function stored(db: Database): Promise<StoredNotifySettings> {
  if (!(await hasTable(db))) return null;
  const [row] = await db.query<{ notify_email: string | null; resend_api_key: string | null }>(
    "SELECT notify_email, resend_api_key FROM notification_settings WHERE id='main'",
  );
  return row ?? null;
}

/** Resolved configuration for sending; a database problem means "not configured". */
export async function loadNotifyConfig(db: Database): Promise<NotifyConfig | null> {
  try {
    return notifyConfig(await stored(db));
  } catch (error) {
    console.error("Notification settings unavailable", error);
    return notifyConfig(null);
  }
}

/** What the administration may see: the address and only the end of the key. */
export async function notificationSettingsView(db: Database) {
  const row = await stored(db);
  const envKey = !!process.env["RESEND_API_KEY"];
  const envEmail = !!process.env["LEAD_NOTIFY_EMAIL"];
  const key = row?.resend_api_key ?? "";
  return {
    email: envEmail ? process.env["LEAD_NOTIFY_EMAIL"] : (row?.notify_email ?? ""),
    keyHint: envKey ? "nastaveno na serveru" : key ? `…${key.slice(-4)}` : null,
    managedByServer: envKey || envEmail,
    ready: !!notifyConfig(row),
  };
}

const input = z.object({
  email: z.string().trim().max(500),
  key: z.string().trim().max(200).optional(),
  clearKey: z.boolean().optional(),
});

export async function saveNotificationSettings(db: Database, adminId: string, raw: unknown) {
  const parsed = input.safeParse(raw);
  if (!parsed.success) throw new HttpError(422, "Zkontrolujte e-mail a klíč.");
  const { email, key, clearKey } = parsed.data;
  const addresses = email
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (addresses.some((address) => !z.string().email().safeParse(address).success))
    throw new HttpError(422, "E-mail pro upozornění není ve správném tvaru.");
  if (key && !/^re_[A-Za-z0-9_-]{8,}$/.test(key))
    throw new HttpError(422, "Klíč z Resendu začíná „re_“. Zkopírujte ho prosím celý.");
  if (!(await hasTable(db)))
    throw new HttpError(503, "Databáze se ještě aktualizuje. Zkuste to prosím za pár minut.");
  await db.transaction(async (tx) => {
    await tx.query(
      `INSERT INTO notification_settings(id, notify_email, resend_api_key, updated_at)
       VALUES ('main', $1, $2, now())
       ON CONFLICT (id) DO UPDATE SET notify_email=$1,
         resend_api_key=CASE WHEN $3::boolean THEN NULL WHEN $2::text IS NULL THEN notification_settings.resend_api_key ELSE $2 END,
         updated_at=now()`,
      [addresses.join(", ") || null, key || null, !!clearKey],
    );
    await audit(tx, adminId, "notifications.update", "main");
  });
  return notificationSettingsView(db);
}
