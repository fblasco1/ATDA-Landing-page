import type { LogoSurface } from "@/lib/sanity/types";

type TileState = "auto" | "rest" | "hover";

/** Logos anteriores al procesamiento automático: los JPG traen fondo propio. */
export function resolveLogoSurface(logoUrl: string | undefined, surface: string | undefined): LogoSurface {
  if (surface === "glass" || surface === "light") return surface;
  return logoUrl && /\.jpe?g(\?|$)/i.test(logoUrl) ? "light" : "glass";
}

const CARD = {
  base: "flex items-center justify-center rounded-2xl border p-4 backdrop-blur-md transition-colors duration-300",
  rest: "border-white/10 bg-white/5",
  hover: "border-white/20 bg-white/10",
  auto: "border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10 group-focus-visible:border-white/20 group-focus-visible:bg-white/10",
};

/**
 * Tarjeta uniforme de la Red: todos los logos en blanco y, al pasar el mouse,
 * con su color si se lee sobre fondo oscuro. Las imágenes con fondo propio
 * (fotos) van en escala de grises para no verse como un rectángulo blanco.
 */
const LOGO_CLASS: Record<"photo" | "color" | "white", Record<TileState, string>> = {
  photo: {
    rest: "rounded-md grayscale opacity-80",
    hover: "rounded-md grayscale-0 opacity-100",
    auto: "rounded-md grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:opacity-100",
  },
  color: {
    rest: "brightness-0 invert opacity-80",
    hover: "brightness-100 invert-0 opacity-100",
    auto: "brightness-0 invert opacity-80 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 group-focus-visible:brightness-100 group-focus-visible:invert-0 group-focus-visible:opacity-100",
  },
  white: {
    rest: "brightness-0 invert opacity-80",
    hover: "brightness-0 invert opacity-100",
    auto: "brightness-0 invert opacity-80 group-hover:opacity-100 group-focus-visible:opacity-100",
  },
};

function logoClass(logoUrl: string, surface: LogoSurface, state: TileState) {
  const kind = /\.jpe?g(\?|$)/i.test(logoUrl) ? "photo" : surface === "glass" ? "color" : "white";
  return LOGO_CLASS[kind][state];
}

export function LogoTile({
  logoUrl,
  surface,
  name,
  state = "auto",
  className = "",
}: {
  logoUrl?: string;
  surface: LogoSurface;
  name: string;
  /** Fuerza el aspecto en reposo o con el mouse encima (vista previa del panel). */
  state?: TileState;
  className?: string;
}) {
  return (
    <div className={`${CARD.base} ${CARD[state]} ${className}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={`max-h-full max-w-full object-contain transition duration-300 ${logoClass(logoUrl, surface, state)}`}
        />
      ) : (
        <span className="text-2xl font-bold text-gray-300">{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
