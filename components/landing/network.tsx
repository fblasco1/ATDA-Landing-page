import { normalizeExternalUrl } from "@/lib/utils";
import type { NetworkPartner } from "@/lib/sanity/types";
import { sectionBandClass, type SectionBand } from "./section-band";

const TILE_BACKGROUND: Record<NonNullable<NetworkPartner["logoBackground"]>, string> = {
  glass:
    "border border-white/10 bg-white/5 backdrop-blur-md transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10",
  white: "bg-white shadow-sm",
  dark: "bg-gray-800/80 ring-1 ring-white/10",
  none: "",
};

function PartnerTile({ partner }: { partner: NetworkPartner }) {
  const href = normalizeExternalUrl(partner.url);
  const background = TILE_BACKGROUND[partner.logoBackground ?? "glass"];
  const inner = (
    <>
      <div className={`flex h-24 w-full max-w-44 items-center justify-center rounded-2xl p-4 sm:h-32 sm:w-52 sm:max-w-none ${background}`}>
        {partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partner.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span
            className={`text-2xl font-bold ${partner.logoBackground === "white" ? "text-slate-600" : "text-gray-300"}`}
          >
            {partner.name.slice(0, 1)}
          </span>
        )}
      </div>
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
