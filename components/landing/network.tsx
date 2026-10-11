import { normalizeExternalUrl } from "@/lib/utils";
import type { NetworkPartner } from "@/lib/sanity/types";
import { sectionBandClass, type SectionBand } from "./section-band";

const TILE_BACKGROUND: Record<NonNullable<NetworkPartner["logoBackground"]>, string> = {
  white: "bg-white shadow-sm",
  dark: "bg-gray-800/80 ring-1 ring-white/10",
  none: "",
};

function PartnerTile({ partner }: { partner: NetworkPartner }) {
  const href = normalizeExternalUrl(partner.url);
  const background = TILE_BACKGROUND[partner.logoBackground ?? "white"];
  const inner = (
    <>
      <div className={`flex h-28 w-44 items-center justify-center rounded-2xl p-4 sm:h-32 sm:w-52 ${background}`}>
        {partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partner.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-2xl font-bold text-slate-400">{partner.name.slice(0, 1)}</span>
        )}
      </div>
      <p className="mt-4 max-w-[13rem] text-center text-sm font-semibold leading-snug text-white sm:text-base">
        {partner.name}
      </p>
    </>
  );

  const className =
    "flex flex-col items-center justify-start transition duration-300 hover:-translate-y-1";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={partner.name}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function Network({ partners, band = "alt" }: { partners: NetworkPartner[]; band?: SectionBand }) {
  if (partners.length === 0) return null;

  return (
    <section id="network" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">Nuestra Red</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Construimos alianzas con un ecosistema de instituciones, empresas y organizaciones que potencian el
            desarrollo tecnológico nacional.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
          {partners.map((partner) => (
            <PartnerTile key={partner._id} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
