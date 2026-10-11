"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ATDALogo } from "@/components/Icons";
import { buttonClass } from "@/components/ui/button";

type NavItem = {
  name: string;
  href: string;
  sectionId?: string;
  matchPath?: string;
  requires?: "network" | "courses";
};

export type HeaderLabels = {
  about: string;
  news: string;
  network: string;
  courses: string;
  contact: string;
  join: string;
};

function buildNavItems(labels: HeaderLabels): NavItem[] {
  return [
    { name: labels.about, href: "/#about", sectionId: "about" },
    { name: labels.news, href: "/novedades", sectionId: "novedades", matchPath: "/novedades" },
    { name: labels.network, href: "/#network", sectionId: "network", requires: "network" },
    {
      name: labels.courses,
      href: "/propuestas",
      sectionId: "propuestas",
      matchPath: "/propuestas",
      requires: "courses",
    },
    { name: labels.contact, href: "/#contact", sectionId: "contact" },
  ];
}

function scrollToHash(href: string) {
  const hash = href.includes("#") ? `#${href.split("#")[1]}` : href;
  if (!hash.startsWith("#")) return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
  const offset = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: offset, behavior: "smooth" });
}

const secondaryButtonClass = buttonClass({ variant: "secondary", size: "sm" });

const primaryButtonClass = buttonClass({ size: "sm" });

function linkClass(active: boolean) {
  return active
    ? "font-semibold text-teal-300"
    : "font-medium text-gray-300 transition-colors hover:text-white";
}

export function Header({
  labels,
  showNetwork = false,
  showCourses = false,
}: {
  labels: HeaderLabels;
  showNetwork?: boolean;
  showCourses?: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
 const [activeSection, setActiveSection] = useState<string | null>(null);

  const navItems = buildNavItems(labels).filter((item) => {
    if (item.requires === "network") return showNetwork;
    if (item.requires === "courses") return showCourses;
    return true;
  });

  const sectionIds = navItems.map((item) => item.sectionId).filter(Boolean) as string[];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
   return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => scrollToHash(hash));
    }

    const elements = sectionIds.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname, sectionIds.join("|")]);

  const isActive = (item: NavItem) => {
    if (item.matchPath && pathname.startsWith(item.matchPath)) return true;
    if (pathname === "/" && item.sectionId && activeSection === item.sectionId) return true;
    return false;
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    setIsOpen(false);
    if (item.href.includes("#") && pathname === "/") {
      event.preventDefault();
      scrollToHash(item.href);
      const hash = `#${item.href.split("#")[1]}`;
      window.history.replaceState(null, "", hash);
      if (item.sectionId) setActiveSection(item.sectionId);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled || pathname !== "/" || isOpen
          ? "bg-gray-900/95 shadow-lg backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label="Volver a la página de inicio"
            className="logo-animate flex items-center justify-self-start text-white"
            onClick={() => setIsOpen(false)}
          >
            <ATDALogo className="h-11 w-auto" showSubtitle={false} />
          </Link>

          <nav
            className="hidden items-center justify-center gap-6 whitespace-nowrap text-[15px] lg:flex xl:gap-9"
            aria-label="Principal"
          >
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.sectionId ?? item.href}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item)}
                  className={linkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-self-end gap-3 whitespace-nowrap lg:flex">
            <Link
              href="/socio/login"
              className={`${secondaryButtonClass} ${
                pathname.startsWith("/socio") ? "border-teal-400/70 text-teal-200" : ""
              }`}
            >
              Acceso socios
            </Link>
            <Link
              href="/asociacion"
              onClick={() => setIsOpen(false)}
              className={`${primaryButtonClass} ${
                pathname.startsWith("/asociacion") ? "ring-2 ring-teal-300/60" : ""
              }`}
            >
              {labels.join}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-md p-1 text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 lg:hidden"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        className={`absolute inset-x-0 top-full overflow-hidden shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "visible max-h-screen opacity-100" : "pointer-events-none invisible max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4 border-t border-gray-800 bg-gray-900 px-6 py-5">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.sectionId ?? item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item)}
                className={`text-lg ${linkClass(active)}`}
                aria-current={active ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="mt-2 grid w-full max-w-xs grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/socio/login"
              onClick={() => setIsOpen(false)}
              className={`${secondaryButtonClass} text-center`}
            >
              Acceso socios
            </Link>
            <Link
              href="/asociacion"
              onClick={() => setIsOpen(false)}
              className={`${primaryButtonClass} text-center`}
            >
              {labels.join}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
