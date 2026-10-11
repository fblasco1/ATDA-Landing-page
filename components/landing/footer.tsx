import Link from "next/link";
import { ATDALogo, InstagramIcon, LinkedInIcon, MailIcon, TwitterIcon } from "@/components/Icons";
import { institutionalLine } from "@/lib/legal/privacy";
import type { LandingSettings } from "@/lib/sanity/types";

export function Footer({ settings }: { settings: LandingSettings }) {
  const year = new Date().getFullYear();
  const links = [
    settings.socialTwitter
      ? { href: settings.socialTwitter, label: "Perfil de ATDA en X/Twitter", icon: TwitterIcon }
      : null,
    settings.socialInstagram
      ? { href: settings.socialInstagram, label: "Perfil de ATDA en Instagram", icon: InstagramIcon }
      : null,
    settings.socialLinkedin
      ? { href: settings.socialLinkedin, label: "Perfil de ATDA en LinkedIn", icon: LinkedInIcon }
      : null,
    settings.contactEmail
      ? { href: settings.contactEmail, label: "Enviar un correo electrónico", icon: MailIcon }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof TwitterIcon }>;
  const institution = institutionalLine(settings);

  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <Link href="/" aria-label="Volver a la página de inicio" className="mb-4 flex items-center text-gray-400 sm:mb-0">
            <ATDALogo className="h-12 w-auto" />
          </Link>
          <div className="flex space-x-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label} (se abre en una pestaña nueva)`}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>
        </div>
        <nav
          aria-label="Información legal"
          className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400"
        >
          <Link href="/privacidad" className="hover:text-white">
            Política de privacidad
          </Link>
          {settings.statuteUrl ? (
            <a href={settings.statuteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Estatuto<span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          ) : null}
          <Link href="/#contact" className="hover:text-white">
            Contacto
          </Link>
        </nav>
        <div className="mt-6 space-y-1 text-center text-sm text-gray-400">
          <p>
            &copy; {year} {settings.footerText}
          </p>
          {institution ? <p>{institution}</p> : null}
          {settings.legalAddress.trim() ? <p>Domicilio legal: {settings.legalAddress.trim()}</p> : null}
        </div>
      </div>
    </footer>
  );
}
