import { SiteText } from "@/components/SiteText";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import { SocialIcons } from "./ContactLinks";

type Kind = "contact" | "valuation" | "property_inquiry";

const base = {
  name: z.string().trim().min(2, "Vyplňte prosím jméno").max(120),
  email: z.string().trim().email("Zadejte platný e-mail").max(255),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s()-]*$/, "Neplatné telefonní číslo")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Pro odeslání je nutný souhlas se zpracováním údajů" }),
  }),
};
const schemas = {
  contact: z.object({
    ...base,
    message: z.string().trim().min(5, "Napište prosím zprávu").max(3000),
  }),
  property_inquiry: z.object(base),
  valuation: z.object({
    ...base,
    property_type: z.string().min(1, "Vyberte typ nemovitosti").max(80),
    property_location: z.string().trim().min(2, "Uveďte lokalitu").max(200),
    property_size: z.string().trim().max(40).optional().or(z.literal("")),
  }),
};

const eventMap = {
  contact: "form_submit_contact",
  valuation: "form_submit_valuation",
  property_inquiry: "property_inquiry",
} as const;

/**
 * Thank-you seal: the green tick lands first, then flips like a tossed coin to a
 * line-drawn smiley that winks with a little sparkle and now and then gives a thumbs-up.
 * Reduced motion keeps the tick.
 */
function SuccessCoin() {
  return (
    <span className="success-coin" aria-hidden="true">
      <span className="coin-inner">
        <span className="coin-face coin-front success-seal">
          <CheckCircle2 className="size-7" />
        </span>
        <span className="coin-face coin-back">
          <svg viewBox="0 0 64 64">
            <ellipse cx="24" cy="27" rx="2.8" ry="4" className="smiley-ink" />
            <ellipse cx="40" cy="27" rx="2.8" ry="4" className="smiley-ink smiley-eye-open" />
            <path d="M36 28 Q40 24 44 28" className="smiley-line smiley-eye-wink" />
            <path d="M21 37 Q32 49 43 37" className="smiley-line smiley-mouth" />
            <g transform="translate(60 27) scale(0.95)">
              <g className="smiley-hand">
                <path d="M7 10v12" className="smiley-line smiley-hand-line" />
                <path
                  d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
                  className="smiley-line smiley-hand-line smiley-hand-fill"
                />
              </g>
            </g>
            <g className="smiley-sparkle">
              <path d="M50 12 L51.3 15.7 L55 17 L51.3 18.3 L50 22 L48.7 18.3 L45 17 L48.7 15.7 Z" />
              <path d="M56.5 24 L57.2 25.8 L59 26.5 L57.2 27.2 L56.5 29 L55.8 27.2 L54 26.5 L55.8 25.8 Z" />
              <path d="M43 8 L43.6 9.4 L45 10 L43.6 10.6 L43 12 L42.4 10.6 L41 10 L42.4 9.4 Z" />
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}

export function LeadForm({
  kind,
  propertySlug,
  defaultMessage,
  submitLabel,
}: {
  kind: Kind;
  propertySlug?: string;
  defaultMessage?: string;
  submitLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state === "done") successRef.current?.focus({ preventScroll: true });
  }, [state]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, unknown>;
    raw["consent"] = fd.get("consent") === "on";
    const parsed = schemas[kind].safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("sending");
    const d = parsed.data as Record<string, string | boolean | undefined>;
    try {
      await api("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          kind,
          name: d["name"] as string,
          email: d["email"] as string,
          phone: (d["phone"] as string) || null,
          message: (d["message"] as string) || null,
          property_slug: propertySlug ?? null,
          property_type: (d["property_type"] as string) || null,
          property_location: (d["property_location"] as string) || null,
          property_size: (d["property_size"] as string) || null,
          consent: true,
          website: fd.get("website") || "",
        }),
      });
    } catch {
      setState("error");
      return;
    }
    track(eventMap[kind], propertySlug ? { property_slug: propertySlug } : {});
    setState("done");
  }

  if (state === "done") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="lead-success">
        <div className="lead-success-content">
          <SuccessCoin />
          <p className="eyebrow mt-6">
            <SiteText>{"Zpráva úspěšně odeslána"}</SiteText>
          </p>
          <h3 className="lead-success-title mt-3">
            <SiteText>{"Děkuji za vaši zprávu."}</SiteText>
          </h3>
          <p className="lead-success-copy mt-4 text-muted-foreground">
            <SiteText>{"Ozvu se vám co nejdříve osobně."}</SiteText>
            <br />
            <SiteText>{"Těším se na společný další krok."}</SiteText>
          </p>
          <div className="lead-success-social">
            <p className="mb-4 text-sm font-medium">
              <SiteText>{"Můžete mě také najít zde"}</SiteText>
            </p>
            <div className="flex justify-center">
              <SocialIcons />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const a = (name: string) => ({
    id: `${kind}-${name}`,
    name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${kind}-${name}-err` : undefined,
    className: "field",
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="sr-only" aria-hidden="true">
        <label>
          <SiteText>{"Webová stránka"}</SiteText>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field kind={kind} errors={errors} name="name" label="Jméno a příjmení *">
          <input {...a("name")} autoComplete="name" maxLength={120} />
        </Field>
        <Field kind={kind} errors={errors} name="phone" label="Telefon">
          <input {...a("phone")} type="tel" autoComplete="tel" maxLength={40} />
        </Field>
      </div>
      <Field kind={kind} errors={errors} name="email" label="E-mail *">
        <input {...a("email")} type="email" autoComplete="email" maxLength={255} />
      </Field>
      {kind === "valuation" && (
        <div className="grid gap-5 sm:grid-cols-3">
          <Field kind={kind} errors={errors} name="property_type" label="Typ *">
            <select {...a("property_type")} defaultValue="">
              <option value="" disabled>
                <SiteText>{"Vyberte"}</SiteText>
              </option>
              <option value="Byt">
                <SiteText>{"Byt"}</SiteText>
              </option>
              <option value="Dům">
                <SiteText>{"Dům"}</SiteText>
              </option>
              <option value="Pozemek">
                <SiteText>{"Pozemek"}</SiteText>
              </option>
              <option value="Komerční">
                <SiteText>{"Komerční"}</SiteText>
              </option>
              <option value="Jiné">
                <SiteText>{"Jiné"}</SiteText>
              </option>
            </select>
          </Field>
          <Field kind={kind} errors={errors} name="property_location" label="Lokalita *">
            <input {...a("property_location")} placeholder="např. Praha 6" maxLength={200} />
          </Field>
          <Field kind={kind} errors={errors} name="property_size" label="Plocha (m²)">
            <input {...a("property_size")} inputMode="numeric" maxLength={40} />
          </Field>
        </div>
      )}
      <Field
        kind={kind}
        errors={errors}
        name="message"
        label={kind === "contact" ? "Zpráva *" : "Zpráva"}
      >
        <textarea {...a("message")} rows={4} maxLength={3000} defaultValue={defaultMessage} />
      </Field>
      <div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 accent-primary"
            aria-invalid={!!errors["consent"]}
          />
          <span>
            <SiteText>
              {"Souhlasím se zpracováním osobních údajů za účelem vyřízení dotazu dle"}
            </SiteText>
            {<SiteText> </SiteText>}
            <Link to="/ochrana-osobnich-udaju" className="underline">
              <SiteText>{"zásad ochrany osobních údajů"}</SiteText>
            </Link>
            . *
          </span>
        </label>
        {errors["consent"] && (
          <p className="mt-1 text-sm text-destructive">
            <SiteText>{errors["consent"]}</SiteText>
          </p>
        )}
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          <SiteText>{"Odeslání se nepovedlo. Zkuste to prosím znovu za chvíli."}</SiteText>
        </p>
      )}
      <div>
        <Button
          type="submit"
          variant={kind === "valuation" ? "valuation" : "default"}
          disabled={state === "sending"}
          className={`btn h-auto min-h-12 whitespace-normal ${kind === "valuation" ? "w-full" : "btn-primary"}`}
        >
          <SiteText>{state === "sending" ? "Odesílám…" : (submitLabel ?? "Odeslat")}</SiteText>
          {<SiteText>{kind === "valuation" && <ArrowUpRight aria-hidden />}</SiteText>}
        </Button>
      </div>
    </form>
  );
}

function Field({
  kind,
  name,
  label,
  errors,
  children,
}: {
  kind: string;
  name: string;
  label: string;
  errors: Record<string, string>;
  children: React.ReactNode;
}) {
  const error = errors[name];
  return (
    <div>
      <label htmlFor={`${kind}-${name}`} className="mb-1.5 block text-sm font-medium">
        <SiteText>{label}</SiteText>
      </label>
      <SiteText>{children}</SiteText>
      {error && (
        <p id={`${kind}-${name}-err`} className="mt-1 text-sm text-destructive">
          <SiteText>{error}</SiteText>
        </p>
      )}
    </div>
  );
}
