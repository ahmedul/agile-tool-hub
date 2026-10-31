"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const links = [
  ["/templates", "Templates"], ["/examples", "Examples"], ["/guides", "Guides"],
  ["/docs", "Docs"], ["/tools", "Tools"], ["/apps", "Apps"], ["/about", "About"],
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white" onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4">
        <Link href="/" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-gray-900 hover:text-blue-600">
          AgileToolHub
        </Link>
        <div className="flex items-center gap-3 lg:order-3">
          <Link href="/search" onClick={() => setMenuOpen(false)} aria-current={pathname === "/search" ? "page" : undefined} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
            Search
          </Link>
          <button ref={menuButton} type="button" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="main-navigation">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        <nav id="main-navigation" aria-label="Main navigation" className={`${menuOpen ? "flex" : "hidden"} basis-full flex-col gap-1 border-t border-gray-100 pt-3 lg:order-2 lg:flex lg:basis-auto lg:flex-row lg:gap-4 lg:border-0 lg:pt-0`}>
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`rounded-lg px-2 py-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 lg:px-0 lg:hover:bg-transparent ${pathname === href || pathname.startsWith(`${href}/`) ? "text-blue-700" : "text-gray-600"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
