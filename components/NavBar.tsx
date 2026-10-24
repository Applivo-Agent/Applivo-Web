"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─── NAV LINKS ──────────────────────────────────────────── */
const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Features", href: "/#features" },
  { label: "Integrations", href: "/#integrations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

type NavBarProps = {
  sidebarOffset?: boolean;
};

export function NavBar({ sidebarOffset = false }: NavBarProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 ${sidebarOffset ? "left-[17rem]" : "left-0"} right-0 z-[70] k-header transition-all duration-300 ${
        scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.06)]" : ""
      }`}
    >
      <div className="k-container flex items-center justify-between h-[54px] md:h-[60px]">

        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="Applivo" width={32} height={32} className="rounded-lg object-contain" priority />
          <span className="text-white font-semibold text-[length:var(--fs-heading)] tracking-tight">Applivo</span>
        </Link>

        {/* Nav links — center */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="k-navlink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA — right */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {!isLoading && isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:block k-navlink"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block k-navlink"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="k-pill-light"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-white"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="md:hidden border-t border-white/[0.06] bg-[color-mix(in_srgb,var(--sx-bg-0a0a0a)_95%,transparent)] backdrop-blur-xl">
          <div className="k-container flex flex-col py-3">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="flex h-11 items-center text-[length:var(--fs-heading)] text-zinc-300 hover:text-white">
                {l.label}
              </Link>
            ))}
            {!isLoading && !isAuthenticated && (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex h-11 items-center text-[length:var(--fs-heading)] text-zinc-300 hover:text-white">Log in</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
