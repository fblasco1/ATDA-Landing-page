import type { ReactNode } from "react";

function httpUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return raw;
  } catch {
    return null;
  }
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-blue-400 underline decoration-blue-400/40 underline-offset-2 hover:text-blue-300"
    >
      {children}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

/** Vuelve cliqueable una URL suelta o un enlace con formato [texto](https://...). */
export function LinkedText({ text }: { text: string }) {
  const token = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<]+/gi;
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(token)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));

    const label = match[1];
    const markdownUrl = match[2];
    if (label && markdownUrl) {
      const href = httpUrl(markdownUrl);
      nodes.push(href ? <ExternalLink key={key} href={href}>{label}</ExternalLink> : match[0]);
    } else {
      const bare = match[0];
      const stripped = bare.replace(/[.,;:!?)]+$/g, "");
      const href = httpUrl(stripped);
      if (href) {
        nodes.push(<ExternalLink key={key} href={href}>{stripped}</ExternalLink>);
        const trailing = bare.slice(stripped.length);
        if (trailing) nodes.push(trailing);
      } else {
        nodes.push(bare);
      }
    }

    key += 1;
    last = start + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
