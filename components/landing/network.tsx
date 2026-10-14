import { normalizeExternalUrl } from "@/lib/utils";
import type { NetworkPartner } from "@/lib/sanity/types";
import { LogoTile, resolveLogoSurface } from "./logo-tile";
import { sectionBandClass, type SectionBand } from "./section-band";

function PartnerTile({ partner }: { partner: NetworkPartner }) {
  const href = normalizeExternalUrl(partner.url);
  const inner = (
    <>
      <LogoTile
        logoUrl={partner.logoUrl}
        surface={resolveLogoSurface(partner.logoUrl, partner.logoSurface)}
        name={partner.name}
        className="h-24 w-full max-w-44 sm:h-32 sm:w-52 sm:max-w-none"
      />
      <p className="mt-4 max-w-[13rem] text-center text-sm font-semibold leading-snug text-white sm:text-base">
        {partner.name}
      </p>
    </>
  );

  const className =
    "group flex flex-col items-center justify-start transition duration-300 hover:-translate-y-1";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={partner.name}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-10">
          {partners.map((partner) => (
            <PartnerTile key={partner._id} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
