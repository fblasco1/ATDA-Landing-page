"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ATDALogo } from "@/components/Icons";

type NavItem = {
  name: string;
  href: string;
  sectionId?: string;
  matchPath?: string;
  requires?: "network" | "courses";
};

const ALL_NAV_ITEMS: NavItem[] = [
  { name: "Sobre Nosotros", href: "/#about", sectionId: "about" },
  { name: "Novedades", href: "/novedades", sectionId: "novedades", matchPath: "/novedades" },
  { name: "Red", href: "/#network", sectionId: "network", requires: "network" },
  {
    name: "Propuestas",
    href: "/propuestas",
    sectionId: "propuestas",
    matchPath: "/propuestas",
    requires: "courses",
  },
  { name: "Contacto", href: "/#contact", sectionId: "contact" },
];

function scrollToHash(href: string) {
  const hash = href.includes("#") ? `#${href.split("#")[1]}` : href;
  if (!hash.startsWith("#")) return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
  const offset = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: offset, behavior: "smooth" });
}

function linkClass(active: boolean) {
  return active
    ? "font-semibold text-teal-300"
    : "font-medium text-gray-300 transition-colors hover:text-white";
}

export function Header({
  showNetwork = false,
  showCourses = false,
}: {
  showNetwork?: boolean;
  showCourses?: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.requires === "network") return showNetwork;
    if (item.requires === "courses") return showCourses;
    return true;
  });

  const sectionIds = navItems.map((item) => item.sectionId).filter(Boolean) as string[];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    const timer = setTimeout(() => setLogoLoaded(true), 100);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

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
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Volver a la página de inicio"
            className={`flex items-center text-white transition-opacity duration-500 ${
              logoLoaded ? "logo-animate" : "opacity-0"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <ATDALogo className="h-12 w-auto" showSubtitle={false} />
          </Link>

          <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex xl:gap-8" aria-label="Principal">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
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

          <div className="hidden items-center gap-4 whitespace-nowrap lg:flex">
            <Link
              href="/socio/login"
              className={`text-sm ${
                pathname.startsWith("/socio") ? "font-semibold text-teal-300" : "text-gray-400 hover:text-white"
              }`}
            >
              Acceso socios
            </Link>
            <Link
              href="/asociacion"
              onClick={() => setIsOpen(false)}
              className={`rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 ${
                pathname.startsWith("/asociacion") ? "ring-2 ring-teal-300/60" : ""
              }`}
            >
              Quiero ser parte
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="text-gray-300 focus:outline-none lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={isOpen}
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
        className={`absolute inset-x-0 top-full overflow-hidden shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-screen opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center space-y-4 bg-gray-900/95 py-4">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item)}
                className={`text-lg ${linkClass(active)}`}
                aria-current={active ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
          <Link
            href="/socio/login"
            onClick={() => setIsOpen(false)}
            className="text-lg text-gray-300 hover:text-white"
          >
            Acceso socios
          </Link>
          <Link
            href="/asociacion"
            onClick={() => setIsOpen(false)}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Quiero ser parte
          </Link>
        </div>
      </div>
    </header>
  );
}
