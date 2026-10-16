import { z } from "zod";
import { normalizeVideoUrl } from "@/lib/property-media";
import { nearbyCategories } from "@/data/nearby";
const text = (max: number) => z.string().trim().max(max);
const imageSource = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      /^\/uploads\/[a-f0-9-]{36}\.webp$/.test(v) ||
      /^\/assets\/[a-zA-Z0-9_.-]+$/.test(v) ||
      /^https:\/\//.test(v),
    "Fotografie musí být nahraná na web nebo mít HTTPS adresu.",
  );
const embed = text(2048).refine((v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" &&
      ((["www.youtube-nocookie.com", "www.youtube.com"].includes(u.hostname) &&
        u.pathname.startsWith("/embed/")) ||
        (u.hostname === "player.vimeo.com" && u.pathname.startsWith("/video/")) ||
        (u.hostname === "my.matterport.com" && u.pathname === "/show/"))
    );
  } catch {
    return false;
  }
}, "Použijte vloženou HTTPS adresu YouTube /embed/, Vimeo /video/ nebo Matterport /show/.");

export const propertySchema = z
  .object({
    title: text(200).min(3, "Název musí mít alespoň 3 znaky."),
    slug: z
      .string()
      .min(3)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL smí obsahovat malá písmena, čísla a pomlčky."),
    publication: z.enum(["draft", "published", "archived"]),
    autoSlug: z.boolean().optional(),
    status: z.enum(["active", "reserved", "sold"]),
    offerType: z.enum(["sale", "rent"]),
    propertyType: z.enum(["byt", "dům", "pozemek", "komerční"]),
    market: z.enum(["cz", "egypt"]).default("cz"),
    disposition: text(80),
    location: z.object({
      city: text(200),
      district: text(200),
      street: text(200).optional(),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }),
    price: z.number().finite().min(0).max(1e12).nullable(),
    priceNote: text(500).optional(),
    area: z.number().finite().min(0).max(1e8),
    landArea: z.number().finite().min(0).max(1e9).optional(),
    floor: text(100).optional(),
    ownership: text(200),
    condition: text(200),
    energyClass: text(20),
    building: text(200).optional(),
    availableFrom: text(200).optional(),
    perex: text(700),
    description: z.array(text(10000)).max(30),
    features: z.array(text(200)).max(50),
    additionalParameters: z
      .array(
        z.object({
          label: text(100).min(1, "Vyplňte název parametru."),
          value: text(1000).min(1, "Vyplňte hodnotu parametru."),
        }),
      )
      .max(20, "Lze přidat nejvýše 20 dalších parametrů.")
      .optional(),
    images: z
      .array(
        z.object({ src: imageSource, alt: text(300), position: z.number().int().min(0).max(99) }),
      )
      .max(50),
    videoUrl: text(2048)
      .transform((value, ctx) => {
        const normalized = normalizeVideoUrl(value);
        if (normalized === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vložte platný odkaz na YouTube video nebo vloženou adresu Vimeo /video/.",
          });
          return z.NEVER;
        }
        return normalized;
      })
      .optional(),
    matterportUrl: embed.optional(),
    nearbyPlaces: z
      .array(
        z.object({
          category: z.enum(nearbyCategories),
          name: text(200).min(2, "Vyplňte název místa (alespoň 2 znaky)."),
          address: text(300).optional(),
          distanceMeters: z
            .number({ invalid_type_error: "Vyplňte vzdálenost v metrech." })
            .finite()
            .int("Zadejte celé metry.")
            .min(0, "Vzdálenost nesmí být záporná.")
            .max(100000, "Maximální vzdálenost je 100 000 m."),
          distanceType: z.enum(["walking", "straight_line"]),
        }),
      )
      .max(20, "U nabídky lze uvést nejvýše 20 míst.")
      .optional(),
    featured: z.boolean(),
    sortOrder: z.number().int().min(0).max(100000),
    publishedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const date = new Date(v);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === v;
      }, "Zadejte platné datum."),
    isDemo: z.boolean().default(false),
    version: z.number().int().positive().optional(),
  })
  .superRefine((v, ctx) => {
    if ((v.location.lat === undefined) !== (v.location.lng === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [v.location.lat === undefined ? "location.lat" : "location.lng"],
        message: "Pro přesnou polohu vyplňte obě souřadnice.",
      });
    }
    if (v.publication !== "published") return;
    const issue = (field: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    if (!v.location.city) issue("location.city", "Před zveřejněním doplňte město.");
    if (!v.area) issue("area", "Před zveřejněním vyplňte plochu.");
    if (v.perex.length < 10) issue("perex", "Před zveřejněním doplňte úvod (alespoň 10 znaků).");
    if (!v.description.some((p) => p.length >= 10))
      issue("description", "Před zveřejněním doplňte popis.");
    if (!v.images.length) issue("images", "Před zveřejněním přidejte alespoň jednu fotografii.");
    if (v.isDemo) issue("isDemo", "Ukázkovou nabídku nelze zveřejnit jako skutečnou.");
  });

export const leadSchema = z
  .object({
    kind: z.enum(["contact", "valuation", "property_inquiry"]),
    name: text(120).min(2),
    email: text(255).email(),
    phone: text(40)
      .regex(/^[+\d\s()-]*$/)
      .nullable()
      .optional(),
    message: text(3000).nullable().optional(),
    property_slug: text(200).nullable().optional(),
    property_type: text(80).nullable().optional(),
    property_location: text(200).nullable().optional(),
    property_size: text(40).nullable().optional(),
    consent: z.literal(true),
    website: text(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "contact" && (v.message?.length ?? 0) < 5)
      ctx.addIssue({ code: "custom", path: ["message"], message: "Vyplňte zprávu." });
    if (v.kind === "valuation" && (!v.property_type || (v.property_location?.length ?? 0) < 2))
      ctx.addIssue({
        code: "custom",
        path: ["property_location"],
        message: "Vyplňte typ a lokalitu.",
      });
    if (v.kind === "property_inquiry" && !v.property_slug)
      ctx.addIssue({ code: "custom", path: ["property_slug"], message: "Chybí nemovitost." });
  });
