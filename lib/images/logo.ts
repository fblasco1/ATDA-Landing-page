import sharp from "sharp";

export type ProcessedLogo = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

const MAX_SIZE = 800;
/** Distancia (máxima diferencia por canal) hasta la que un píxel es fondo puro. */
const BG_TOLERANCE = 24;
/** Hasta esta distancia el píxel es borde suavizado: queda semitransparente. */
const EDGE_TOLERANCE = 90;

type Rgb = [number, number, number];

function distance(data: Buffer, offset: number, bg: Rgb) {
  return Math.max(
    Math.abs(data[offset] - bg[0]),
    Math.abs(data[offset + 1] - bg[1]),
    Math.abs(data[offset + 2] - bg[2]),
  );
}

function borderOffsets(width: number, height: number) {
  const offsets: number[] = [];
  for (let x = 0; x < width; x++) {
    offsets.push(x * 4, ((height - 1) * width + x) * 4);
  }
  for (let y = 1; y < height - 1; y++) {
    offsets.push(y * width * 4, (y * width + width - 1) * 4);
  }
  return offsets;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Color de fondo si el borde de la imagen es (casi) de un solo color. */
function uniformBackground(data: Buffer, width: number, height: number): Rgb | null {
  const border = borderOffsets(width, height);
  const bg: Rgb = [
    median(border.map((o) => data[o])),
    median(border.map((o) => data[o + 1])),
    median(border.map((o) => data[o + 2])),
  ];
  const matching = border.filter((o) => distance(data, o, bg) <= BG_TOLERANCE * 2).length;
  return matching / border.length >= 0.8 ? bg : null;
}

function isAlreadyTransparent(data: Buffer, width: number, height: number) {
  const border = borderOffsets(width, height);
  const transparent = border.filter((o) => data[o + 3] < 16).length;
  return transparent / border.length >= 0.5;
}

/**
 * Vuelve transparente todo el color de fondo, también el encerrado (contraformas
 * de letras), porque el sitio muestra el logo como silueta blanca. Los bordes
 * suavizados quedan semitransparentes y sin el tinte del fondo.
 */
function removeBackground(data: Buffer, bg: Rgb) {
  for (let offset = 0; offset < data.length; offset += 4) {
    const d = distance(data, offset, bg);
    if (d <= BG_TOLERANCE) {
      data[offset + 3] = 0;
      continue;
    }
    if (d >= EDGE_TOLERANCE) continue;
    const alpha = (d - BG_TOLERANCE) / (EDGE_TOLERANCE - BG_TOLERANCE);
    for (let c = 0; c < 3; c++) {
      const unmixed = (data[offset + c] - bg[c] * (1 - alpha)) / alpha;
      data[offset + c] = Math.max(0, Math.min(255, Math.round(unmixed)));
    }
    data[offset + 3] = Math.round(alpha * data[offset + 3]);
  }
}

function opaqueBounds(data: Buffer, width: number, height: number) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/**
 * Normaliza un logo subido desde el panel: quita el fondo liso y recorta los
 * márgenes. Si el fondo no es liso (una foto) se guarda como JPG sin tocar. Los
 * SVG se suben tal cual.
 */
export async function processLogo(input: Buffer, contentType: string, name: string): Promise<ProcessedLogo> {
  if (contentType === "image/svg+xml") {
    return { buffer: input, contentType, filename: name };
  }
  const baseName = name.replace(/\.[^.]+$/, "") || "logo";

  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  if (!isAlreadyTransparent(data, width, height)) {
    const bg = uniformBackground(data, width, height);
    if (!bg) {
      const buffer = await sharp(data, { raw: { width, height, channels: 4 } })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 90 })
        .toBuffer();
      return { buffer, contentType: "image/jpeg", filename: `${baseName}.jpg` };
    }
    removeBackground(data, bg);
  }

  const bounds = opaqueBounds(data, width, height);
  let image = sharp(data, { raw: { width, height, channels: 4 } });
  if (bounds) image = image.extract(bounds);
  const buffer = await image.png({ compressionLevel: 9 }).toBuffer();
  return { buffer, contentType: "image/png", filename: `${baseName}.png` };
}
