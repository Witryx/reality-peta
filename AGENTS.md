<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Site contact/tracking defaults live only in `src/config/site.ts`. Owner-editable public contact overrides are stored in `website_content` and validated/resolved by this same config module; tracking IDs remain developer-only. Empty contacts render as visible placeholders.
- Property data is read only through async functions in `src/data/properties.ts` matching `src/data/types.ts` — so a database/admin can replace demo data without UI changes.
- All form submissions go to the `leads` table (anon insert-only RLS) — no form may only show a thank-you.
- Conversion events go only through `track()` in `src/lib/analytics.ts`; third-party scripts load only via `TrackingScripts` after consent — GDPR gating in one place.
- Uploaded brand media uses asset-pointer imports, and the shared about section selects a full-length or close portrait by a prop — keeps branding consistent without duplicating section content.
- Shared BrandLockup, GoogleRating and EgyptSection present reusable identity and service content; partner names and review URL live in site config — prevents inconsistent branding and invented links.
- PageMotion progressively enhances non-hero route sections with IntersectionObserver and CSS variants; the homepage hero has independent layered CSS entry motion, and parallax uses supported CSS scroll timelines only — avoids duplicate animations and scroll handlers while honoring reduced motion.
- Valuation styling uses the shared Button valuation variant and ValuationSection; standalone pages opt into its h1 while embedded sections use h2 — keeps conversion hierarchy and semantics consistent without changing form submission logic.
- CollaborationStrip and Egypt's Partners share supplied originals via PartnerLogo asset-pointer imports, below the configured partner names. Partner order identifies each logo even when names are edited; unsupported brands retain their explicit logo placeholder in Egypt — never invent partner logos.
- PropertyCarousel uses the shared Embla carousel for manual homepage browsing, with reduced-motion support and no autoplay; the full listing remains a separate route — preserves both discovery and overview without changing data access.
- SectionConnector adds aria-hidden architectural dividers only between selected homepage chapters, using PageMotion and supported CSS scroll timelines with a static reduced-motion fallback — connects sections without changing their content or adding scroll listeners.
- Egypt offers share the same `Property` model via an optional `market: "cz" | "egypt"` field; `listEgypt()` serves the Egypt carousel, `listProperties()`/`listFeatured()` return only Czech (`market` defaults to "cz"), and `getProperty()` searches both — an admin can replace either list without UI changes.
- Self-hosting uses the standard TanStack Start/Nitro Node build, PostgreSQL and local WebP uploads. Public property reads stay behind `src/data/properties.ts`; development-only demo fallback is disabled in production.
- Every admin endpoint in `src/server/api.server.ts` requires a database-backed HttpOnly session; writes also validate Origin. Public leads insert under `SET LOCAL ROLE realty_anon`, which has insert-only RLS. Production uses the restricted `realty_app` role, separate from migration credentials.
- Brand asset-pointer imports resolve local originals in `public/brand` or beside their pointers in `src/assets` through the Vite plugin (also supports `public/assets` and the public root). Missing originals use explicit placeholders; never replace the agent's portrait or invent a logo.
- Administration shares the public site's colour tokens and BrandLockup; keep navigation, forms and login visually consistent with the main site.
- Nearby places are manually verified entries in optional `Property.nearbyPlaces`, saved with the property JSONB and read through `src/data/properties.ts`. Always show metres and whether the distance is walking or straight-line; never invent places or distances, or silently call a paid Places API.
- Public copy uses transparent `SiteText` bindings and the root-loaded `WebsiteContentContext`. Overrides in `website_content` are plain text, saved through authenticated Origin-checked admin endpoints with a version check and audit entry. Keep links, form option values, layout, consent gating and property data independent of editable labels; regenerate the text catalog when adding public copy, and keep existing source defaults stable or migrate their keys.
- Articles are read asynchronously through `src/data/articles.ts` from the `articles` table; drafts and archived articles stay private. Admin writes require a session, Origin validation, version checks and audit entries. Migration imports the original articles and existing text overrides once; article content is then edited independently of `SiteText` labels.
- Website photographs use stable `image.*` bindings in the root-loaded content context, with validated local media pointers and editable alt descriptions in `website_content`. Preserve asset-pointer originals as fallbacks and protect referenced media in properties, articles and website content from deletion.
- An empty `image.*` override explicitly removes a website photograph; an absent key restores its original. Removed photographs render no image or brand placeholder, and their public layout regions collapse when empty.
- Production Vercel builds migrate through a separate `DATABASE_URL` connection before compilation; preview/local builds never migrate. Runtime keeps restricted `APP_DATABASE_URL`. Original articles and existing media remain available before the article table upgrade.
- The PostgreSQL adapter wraps explicit JSONB parameters with `sql.json` after parsing serialized documents, preventing double encoding. Migration `jsonb-encoding-v1` decodes legacy JSON-string documents without changing their contents or edit versions.
- Admin recovery stays offline or in an owner-authorized production deployment, never a public reset endpoint. Deployment requests contain only a salted hash, expire, are bound to the Vercel project ID and are consumed once in the audit log. Reset existing accounts only, revoke their sessions and never log plaintext passwords or database secrets.
- Hosted Vercel uploads persist WebP bytes in `media_files` alongside atomically saved `media` metadata; self-hosting still defaults to disk (`MEDIA_STORAGE=database` is optional). Serve both through the existing authenticated/public-reference checks at `/uploads/…`. Shared client upload preparation caps request bodies at 3.5 MB while accepting source files up to 12 MB; do not replace durable storage with `/tmp`.
