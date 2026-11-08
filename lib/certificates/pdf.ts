import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const TEMPLATE_PATH = path.join(process.cwd(), "assets", "certificates", "modelo.pdf");

const FONT_SIZE = 18;
const LINE_GAP = 29.9;
const FIRST_BASELINE = 339.2;
const DATE_BASELINE = 169.7;
const DATE_RIGHT = 771.9;
const CENTER_X = 420.95;
const MAX_LINE_WIDTH = 724;

export type CertificatePdfInput = {
  nombre: string;
  curso: string;
  dni?: string;
  fecha?: string;
  lugar?: string;
  resolucion?: string;
  horas?: string;
};

type Token = { text: string; bold: boolean; width: number };

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ");
}

function drawToken(page: PDFPage, token: Token, x: number, y: number, size: number, regular: PDFFont, bold: PDFFont) {
  const font = token.bold ? bold : regular;
  try {
    page.drawText(token.text, { x, y, size, font, color: rgb(0, 0, 0) });
  } catch {
    const safe = fold(token.text);
    if (safe) page.drawText(safe, { x, y, size, font, color: rgb(0, 0, 0) });
  }
}

export function formatDni(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 9) return trimmed;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function hoursPhrase(horas: string) {
  const value = horas.trim();
  if (!value) return "";
  if (/hora/i.test(value)) return /[.]$/.test(value) ? value : `${value}.`;
  return `${value} horas reloj.`;
}

function coursePhrase(curso: string, resolucion: string) {
  const title = curso.replace(/[«»“”"]/g, "").trim();
  const quoted = `Jornada "${title}"`;
  const resolution = resolucion.trim();
  if (!resolution) return quoted;
  if (/^resoluci[oó]n/i.test(resolution)) return `${quoted} , aprobado bajo ${resolution}`;
  return `${quoted} , aprobado bajo Resolución N° ${resolution}`;
}

function paragraphRuns(input: CertificatePdfInput) {
  const nombre = input.nombre.trim();
  const dni = formatDni(input.dni ?? "");
  const horas = hoursPhrase(input.horas ?? "");
  const name = dni ? `${nombre}; D.N.I. ${dni}` : nombre;
  const runs: { text: string; bold: boolean }[] = [
    { text: "La ", bold: false },
    { text: "UNIVERSIDAD TECNOLÓGICA NACIONAL", bold: true },
    {
      text: " en el marco de su compromiso con la formación continua y la excelencia académica, extiende el presente certificado a ",
      bold: false,
    },
    { text: name, bold: true },
    { text: ", en reconocimiento por haber participado en la ", bold: false },
    { text: coursePhrase(input.curso, input.resolucion ?? ""), bold: true },
  ];
  if (horas) {
    runs.push(
      { text: ", cuya carga horaria es de ", bold: false },
      { text: horas, bold: true },
    );
  } else {
    runs.push({ text: ".", bold: false });
  }
  return runs;
}

function wrapRuns(runs: { text: string; bold: boolean }[], regular: PDFFont, bold: PDFFont, size: number) {
  const tokens: Token[] = [];
  for (const run of runs) {
    const font = run.bold ? bold : regular;
    for (const part of run.text.split(/(\s+)/)) {
      if (!part) continue;
      tokens.push({ text: part, bold: run.bold, width: font.widthOfTextAtSize(part, size) });
    }
  }

  const lines: Token[][] = [];
  let current: Token[] = [];
  let width = 0;
  for (const token of tokens) {
    const blank = !token.text.trim();
    if (blank && current.length === 0) continue;
    if (!blank && width + token.width > MAX_LINE_WIDTH && current.length > 0) {
      lines.push(current);
      current = [];
      width = 0;
    }
    current.push(token);
    width += token.width;
  }
  if (current.length) lines.push(current);
  return lines;
}

export async function renderCertificatePdf(input: CertificatePdfInput) {
  const template = await readFile(TEMPLATE_PATH);
  const doc = await PDFDocument.load(template);
  const page = doc.getPages()[0];
  if (!page) throw new Error("El modelo de certificado no tiene páginas.");

  const regular = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const width = page.getWidth();

  page.drawRectangle({
    x: 46,
    y: 156,
    width: width - 86,
    height: 214,
    color: rgb(1, 1, 1),
  });

  const runs = paragraphRuns(input);
  let size = FONT_SIZE;
  let gap = LINE_GAP;
  let lines = wrapRuns(runs, regular, bold, size);
  while (lines.length > 1 && FIRST_BASELINE - (lines.length - 1) * gap < 192 && size > 13) {
    size -= 1;
    gap = LINE_GAP * (size / FONT_SIZE);
    lines = wrapRuns(runs, regular, bold, size);
  }

  lines.forEach((line, index) => {
    const lineWidth = line.reduce((sum, token) => sum + token.width, 0);
    let x = CENTER_X - lineWidth / 2;
    const y = FIRST_BASELINE - index * gap;
    for (const token of line) {
      drawToken(page, token, x, y, size, regular, bold);
      x += token.width;
    }
  });

  const lugar = input.lugar?.trim() ?? "";
  const fecha = input.fecha?.trim() ?? "";
  const dateText = [lugar, fecha].filter(Boolean).join(", ");
  if (dateText) {
    const dateWidth = regular.widthOfTextAtSize(dateText, FONT_SIZE);
    drawToken(
      page,
      { text: dateText, bold: false, width: dateWidth },
      DATE_RIGHT - dateWidth,
      DATE_BASELINE,
      FONT_SIZE,
      regular,
      bold,
    );
  }

  return Buffer.from(await doc.save());
}
