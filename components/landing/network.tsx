import { normalizeExternalUrl } from "@/lib/utils";
import type { NetworkPartner } from "@/lib/sanity/types";
import { PartnerLogo } from "./logo-tile";
import { sectionBandClass, type SectionBand } from "./section-band";

function PartnerItem({ partner }: { partner: NetworkPartner }) {
  const href = normalizeExternalUrl(partner.url);
  const className = "group flex h-16 items-center justify-center rounded-lg px-2";
  const logo = <PartnerLogo logoUrl={partner.logoUrl} name={partner.name} interactive={Boolean(href)} />;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={partner.name}>
        {logo}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    );
  }

  return (
    <div className={className} title={partner.name}>
      {logo}
    </div>
  );
}

export function Network({
  partners,
  title,
  subtitle,
  band = "alt",
}: {
  partners: NetworkPartner[];
  title: string;
  subtitle: string;
  band?: SectionBand;
}) {
  if (partners.length === 0) return null;

  return (
    <section id="network" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{title}</h2>
          {subtitle ? <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">{subtitle}</p> : null}
        </div>
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-10 sm:gap-x-16">
          {partners.map((partner) => (
            <li key={partner._id}>
              <PartnerItem partner={partner} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
