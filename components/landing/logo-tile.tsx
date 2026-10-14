/** Área que ocupa cada logo: así uno cuadrado y uno apaisado pesan lo mismo. */
const LOGO_AREA = 150 * 48;
const MAX_WIDTH = 180;
const MAX_HEIGHT = 64;

/** Las URLs de Sanity terminan en -<ancho>x<alto>.<ext>. */
function logoSize(logoUrl: string) {
  const match = logoUrl.match(/-(\d+)x(\d+)\.\w+(\?|$)/);
  const ratio = match ? Number(match[1]) / Number(match[2]) : 3;
  let width = Math.sqrt(LOGO_AREA * ratio);
  let height = width / ratio;
  if (height > MAX_HEIGHT) {
    height = MAX_HEIGHT;
    width = height * ratio;
  }
  if (width > MAX_WIDTH) {
    width = MAX_WIDTH;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

/** Imágenes con fondo propio (no se pudo quitar): la máscara blanca las volvería un rectángulo. */
function hasOwnBackground(logoUrl: string) {
  return /\.jpe?g(\?|$)/i.test(logoUrl);
}

/**
 * Logo de la Red en blanco sobre el fondo oscuro, sin tarjeta, como un muro de
 * marcas. Sin logo se muestra el nombre como texto.
 */
export function PartnerLogo({
  logoUrl,
  name,
  interactive = true,
  decorative = false,
}: {
  logoUrl?: string;
  name: string;
  /** El nombre ya figura como texto al lado: la imagen no se anuncia. */
  decorative?: boolean;
  /** Sube la opacidad con hover/foco del contenedor `group`. */
  interactive?: boolean;
}) {
  const hover = interactive ? "group-hover:opacity-100 group-focus-visible:opacity-100" : "";
  if (!logoUrl) {
    return (
      <span className={`text-center text-lg font-semibold leading-tight text-white opacity-70 transition-opacity duration-300 ${hover}`}>
        {name}
      </span>
    );
  }
  const { width, height } = logoSize(logoUrl);
  const mask = hasOwnBackground(logoUrl) ? "rounded-md grayscale" : "brightness-0 invert";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={decorative ? "" : name}
      width={width}
      height={height}
      style={{ width, height }}
      className={`max-w-full object-contain opacity-70 transition-opacity duration-300 ${mask} ${hover}`}
    />
  );
}
