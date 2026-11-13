import { afterEach, describe, expect, it, vi } from "vitest";
import { leadRows, notifyConfig, notifyNewLead, sendLeadEmail } from "./lead-notify.server";

const lead = {
  kind: "valuation" as const,
  name: "Jana Nováková",
  email: "jana@example.cz",
  phone: "+420 777 000 111",
  property_type: "Byt",
  property_location: "Praha 7",
  property_size: "",
  message: null,
};
const config = { key: "re_test", to: ["petr@example.cz"], from: "Web <web@example.cz>" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("lead notification", () => {
  it("lists only filled values", () => {
    expect(leadRows(lead, "https://web.cz").map(([label]) => label)).toEqual([
      "Typ",
      "Jméno",
      "Telefon",
      "E-mail",
      "Typ nemovitosti",
      "Lokalita",
    ]);
  });

  it("uses the environment first, then the administration, otherwise stays off", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("LEAD_NOTIFY_EMAIL", "");
    expect(notifyConfig(null)).toBeNull();
    expect(notifyConfig({ notify_email: "a@b.cz", resend_api_key: "re_saved" })?.key).toBe(
      "re_saved",
    );
    vi.stubEnv("RESEND_API_KEY", "re_env");
    expect(notifyConfig({ notify_email: "a@b.cz, c@d.cz", resend_api_key: "re_saved" })).toMatchObject(
      { key: "re_env", to: ["a@b.cz", "c@d.cz"] },
    );
  });

  it("sends nothing without configuration", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await notifyNewLead(lead, "https://web.cz", null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("e-mails the agent with a reply-to the client", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendLeadEmail(config, lead, "https://web.cz")).resolves.toEqual({ ok: true });
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body.to).toEqual(["petr@example.cz"]);
    expect(body.reply_to).toBe("jana@example.cz");
    expect(body.subject).toBe("Žádost o odhad ceny: Jana Nováková, Praha 7");
  });

  it("never throws when sending fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyNewLead(lead, "https://web.cz", config)).resolves.toBeUndefined();
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});
