export function classroomUrlError(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Pegá el enlace del aula.";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "El enlace del aula tiene que empezar con http:// o https://.";
    }
  } catch {
    return "El enlace del aula no es una URL válida.";
  }
  return null;
}

export function safeClassroomUrl(value: string | undefined | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || classroomUrlError(trimmed)) return null;
  return trimmed;
}
