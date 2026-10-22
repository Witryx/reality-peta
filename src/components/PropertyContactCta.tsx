import { ContactLinks } from "./ContactLinks";
import { SiteText } from "./SiteText";
import { cn } from "@/lib/utils";

export function PropertyContactCta({ className }: { className?: string }) {
  return (
    <div className={cn("mt-10 rounded-lg border bg-surface p-6 md:mt-12 md:p-10", className)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
        <div>
          <h2 className="max-w-2xl text-3xl leading-tight md:text-4xl">
            <SiteText>
              {"Líbí se vám tato prezentace a uvažujete i o prodeji vaší nemovitosti?"}
            </SiteText>
          </h2>
          <p className="mt-5 text-lg font-medium">
            <SiteText>{"Kontaktujte mě:"}</SiteText>
          </p>
        </div>
        <ContactLinks />
      </div>
    </div>
  );
}
