import { ATDALogo, KnowledgeIcon, InstagramIcon, LinkedInIcon, MailIcon, TwitterIcon } from "@/components/Icons";
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
    settings.statuteUrl ? { href: settings.statuteUrl, label: "Ver estatuto", icon: KnowledgeIcon } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof TwitterIcon }>;

  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <a href="#home" aria-label="Volver a la página de inicio" className="mb-4 flex items-center text-gray-400 sm:mb-0">
            <ATDALogo className="h-12 w-auto" />
          </a>
          <div className="flex space-x-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500">
          <p>
            &copy; {year} {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
