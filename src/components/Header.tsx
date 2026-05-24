"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
          AgileToolHub
        </Link>
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <nav className={`${menuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-16 left-0 right-0 bg-white md:bg-transparent border-b md:border-0 border-gray-200 p-4 md:p-0 gap-2 md:gap-6 z-50`}>
          <Link href="/templates" className="text-gray-600 hover:text-blue-600 font-medium">Templates</Link>
          <Link href="/examples" className="text-gray-600 hover:text-blue-600 font-medium">Examples</Link>
          <Link href="/guides" className="text-gray-600 hover:text-blue-600 font-medium">Guides</Link>
          <Link href="/docs" className="text-gray-600 hover:text-blue-600 font-medium">Docs</Link>
          <Link href="/tools" className="text-gray-600 hover:text-blue-600 font-medium">Tools</Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
        </nav>
      </div>
    </header>
  );
}
