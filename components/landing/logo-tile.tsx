import type { LogoSurface } from "@/lib/sanity/types";

const SURFACE_CLASS: Record<LogoSurface, string> = {
  glass:
    "border border-white/10 bg-white/5 backdrop-blur-md transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10",
  light: "border border-white/10 bg-slate-100 shadow-sm",
};

/** Logos anteriores al procesamiento automático: los JPG traen fondo propio. */
export function resolveLogoSurface(logoUrl: string | undefined, surface: string | undefined): LogoSurface {
  if (surface === "glass" || surface === "light") return surface;
  return logoUrl && /\.jpe?g(\?|$)/i.test(logoUrl) ? "light" : "glass";
}

export function LogoTile({
  logoUrl,
  surface,
  name,
  className = "",
}: {
  logoUrl?: string;
  surface: LogoSurface;
  name: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center rounded-2xl p-4 ${SURFACE_CLASS[surface]} ${className}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={`max-h-full max-w-full object-contain ${surface === "light" ? "mix-blend-multiply" : ""}`}
        />
      ) : (
        <span className={`text-2xl font-bold ${surface === "light" ? "text-slate-600" : "text-gray-300"}`}>
          {name.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
