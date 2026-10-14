import sharp from "sharp";
import type { LogoSurface } from "@/lib/sanity/types";

export type ProcessedLogo = {
  buffer: Buffer;
  contentType: string;
  filename: string;
  surface: LogoSurface;
};

const MAX_SIZE = 800;
/** Distancia (máxima diferencia por canal) hasta la que un píxel es fondo puro. */
const BG_TOLERANCE = 24;
/** Hasta esta distancia el píxel es borde suavizado: queda semitransparente. */
const EDGE_TOLERANCE = 90;
/** Color de la tarjeta translúcida sobre la banda oscura de la sección. */
const GLASS_RGB: [number, number, number] = [29, 36, 51];
const MIN_CONTRAST = 3;

type Rgb = [number, number, number];

function channelToLinear(value: number) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: Rgb) {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

const GLASS_LUMINANCE = luminance(GLASS_RGB);

function contrastWithGlass(rgb: Rgb) {
  const l = luminance(rgb);
  const [hi, lo] = l > GLASS_LUMINANCE ? [l, GLASS_LUMINANCE] : [GLASS_LUMINANCE, l];
  return (hi + 0.05) / (lo + 0.05);
}

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
 * Vuelve transparente el fondo conectado con los bordes. Los blancos internos del
 * logo (letras, contraformas) no se tocan.
 */
function removeBackground(data: Buffer, width: number, height: number, bg: Rgb) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  for (const offset of borderOffsets(width, height)) {
    const index = offset / 4;
    if (!visited[index] && distance(data, offset, bg) <= BG_TOLERANCE) {
      visited[index] = 1;
      queue.push(index);
    }
  }

  const edges = new Set<number>();
  while (queue.length > 0) {
    const index = queue.pop()!;
    data[index * 4 + 3] = 0;
    const x = index % width;
    const y = (index - x) / width;
    const neighbors = [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      y > 0 ? index - width : -1,
      y < height - 1 ? index + width : -1,
    ];
    for (const next of neighbors) {
      if (next < 0 || visited[next]) continue;
      const d = distance(data, next * 4, bg);
      if (d <= BG_TOLERANCE) {
        visited[next] = 1;
        queue.push(next);
      } else if (d < EDGE_TOLERANCE) {
        edges.add(next);
      }
    }
  }

  for (const index of edges) {
    if (visited[index]) continue;
    const offset = index * 4;
    const alpha = (distance(data, offset, bg) - BG_TOLERANCE) / (EDGE_TOLERANCE - BG_TOLERANCE);
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
 * Decide la tarjeta: translúcida si el logo se lee sobre fondo oscuro y no le
 * quedan áreas internas del color del fondo original; si no, tarjeta clara.
 */
function chooseSurface(data: Buffer, bg: Rgb | null): LogoSurface {
  let opaque = 0;
  let lowContrast = 0;
  let leftoverBackground = 0;
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset + 3] < 128) continue;
    opaque++;
    const rgb: Rgb = [data[offset], data[offset + 1], data[offset + 2]];
    if (contrastWithGlass(rgb) < MIN_CONTRAST) lowContrast++;
    if (bg && distance(data, offset, bg) <= BG_TOLERANCE) leftoverBackground++;
  }
  if (opaque === 0) return "light";
  if (lowContrast / opaque > 0.4) return "light";
  if (leftoverBackground / opaque > 0.02) return "light";
  return "glass";
}

/**
 * Normaliza un logo subido desde el panel: recorta márgenes, quita el fondo
 * uniforme y elige la tarjeta con la que se muestra. Los SVG se suben tal cual.
 */
export async function processLogo(input: Buffer, contentType: string, name: string): Promise<ProcessedLogo> {
  const baseName = name.replace(/\.[^.]+$/, "") || "logo";
  const isSvg = contentType === "image/svg+xml";

  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: !isSvg })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  if (isSvg) {
    return { buffer: input, contentType, filename: name, surface: chooseSurface(data, null) };
  }

  let bg: Rgb | null = null;
  if (!isAlreadyTransparent(data, width, height)) {
    bg = uniformBackground(data, width, height);
    if (!bg) {
      const buffer = await sharp(data, { raw: { width, height, channels: 4 } })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 90 })
        .toBuffer();
      return { buffer, contentType: "image/jpeg", filename: `${baseName}.jpg`, surface: "light" };
    }
    removeBackground(data, width, height, bg);
  }

  const bounds = opaqueBounds(data, width, height);
  let image = sharp(data, { raw: { width, height, channels: 4 } });
  if (bounds) image = image.extract(bounds);
  const buffer = await image.png({ compressionLevel: 9 }).toBuffer();
  return { buffer, contentType: "image/png", filename: `${baseName}.png`, surface: chooseSurface(data, bg) };
}
