export type CertificateRecipient = {
  key: string;
  nombre: string;
  correo: string;
  dni: string;
  asistio: boolean;
  enviado: string;
  fecha: string;
  curso: string;
};

export type ParsedCertificateSheet = {
  sheetName: string;
  rows: CertificateRecipient[];
};

const HEADER_ALIASES = {
  nombre: ["nombre y apellido", "apellido y nombre", "nombre completo", "nombre", "participante", "asistente"],
  correo: ["correo electronico", "correo", "email", "e-mail", "mail"],
  dni: ["dni", "documento", "documento de identidad", "nro documento", "numero de documento"],
  asistio: ["asistio", "participo", "asistencia", "presente"],
  enviado: ["enviado", "estado de envio"],
  fecha: ["fecha", "fecha del certificado", "dia"],
  curso: ["capacitacion", "curso", "charla", "actividad", "propuesta"],
} as const;

export function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cellText(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function findColumn(headers: string[], aliases: readonly string[]) {
  const normalized = headers.map((header) => normalizeKey(header));
  for (const alias of aliases) {
    const index = normalized.indexOf(alias);
    if (index >= 0) return index;
  }
  return -1;
}

function findHeaderRow(matrix: unknown[][]) {
  const limit = Math.min(matrix.length, 8);
  for (let index = 0; index < limit; index += 1) {
    const headers = (matrix[index] ?? []).map(cellText);
    if (findColumn(headers, HEADER_ALIASES.nombre) >= 0 && findColumn(headers, HEADER_ALIASES.correo) >= 0) {
      return index;
    }
  }
  return -1;
}

const NOT_YES = new Set(["no", "n", "pendiente", "false", "0", "-", "error", "ausente"]);

/** Sí, x, 1 o una fecha cuentan como marca. No, ausente y vacío no. */
export function isMarkedYes(value: string) {
  const key = normalizeKey(value);
  if (!key) return false;
  return !NOT_YES.has(key);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function parseCertificateWorkbook(file: File): Promise<
  { ok: true; sheet: ParsedCertificateSheet } | { ok: false; error: string }
> {
  try {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return { ok: false, error: "El Excel no tiene hojas." };
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return { ok: false, error: "No se pudo leer la primera hoja." };

    const matrix = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as unknown[][];

    const headerRow = findHeaderRow(matrix);
    if (headerRow < 0) {
      return {
        ok: false,
        error: "No encontré las columnas Nombre y apellido y Correo. Revisá que la primera fila sea el encabezado.",
      };
    }

    const headers = (matrix[headerRow] ?? []).map(cellText);
    const nombreCol = findColumn(headers, HEADER_ALIASES.nombre);
    const correoCol = findColumn(headers, HEADER_ALIASES.correo);
    const dniCol = findColumn(headers, HEADER_ALIASES.dni);
    const asistioCol = findColumn(headers, HEADER_ALIASES.asistio);
    const enviadoCol = findColumn(headers, HEADER_ALIASES.enviado);
    const fechaCol = findColumn(headers, HEADER_ALIASES.fecha);
    const cursoCol = findColumn(headers, HEADER_ALIASES.curso);

    const rows: CertificateRecipient[] = [];
    for (let index = headerRow + 1; index < matrix.length; index += 1) {
      const line = matrix[index] ?? [];
      const nombre = cellText(line[nombreCol]);
      const correo = cellText(line[correoCol]);
      const fecha = fechaCol >= 0 ? cellText(line[fechaCol]) : "";
      const curso = cursoCol >= 0 ? cellText(line[cursoCol]) : "";
      const dni = dniCol >= 0 ? cellText(line[dniCol]) : "";
      if (!nombre && !correo && !curso) continue;
      rows.push({
        key: `excel-${index}`,
        nombre,
        correo,
        dni,
        asistio: asistioCol >= 0 ? isMarkedYes(cellText(line[asistioCol])) : false,
        enviado: enviadoCol >= 0 ? cellText(line[enviadoCol]) : "",
        fecha,
        curso,
      });
    }

    if (!rows.length) return { ok: false, error: "La hoja no tiene destinatarios." };
    return { ok: true, sheet: { sheetName, rows } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "No se pudo leer el Excel." };
  }
}

export async function downloadUpdatedWorkbook(input: {
  matrix: unknown[][];
  sheetName: string;
  filename: string;
}) {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet(input.matrix);
  const book = XLSX.utils.book_new();
  const safeName = input.sheetName.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Certificados";
  XLSX.utils.book_append_sheet(book, sheet, safeName);
  XLSX.writeFile(book, input.filename);
}
