"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const activeColor = "text-[#FF8C00]";
  const inactiveColor = "transition hover:text-[#994899]";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/service", label: "Service" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
    
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md ">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Link href="/" className="text-[#994899]">
            JEDI
          </Link>
        </div>
        <div className="hidden gap-8 font-medium text-gray-700 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${pathname === link.href ? activeColor : inactiveColor}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className={`font-medium ${pathname === "/auth/login" ? activeColor : "text-gray-700 " + inactiveColor}`}>
            Log In
          </Link>
          <Link href="/auth/sign-up" className="rounded-full bg-[#994899] px-6 py-2.5 font-semibold text-white transition hover:bg-[#7d3a7d]">
            Get Started Free
          </Link>
        </div>
      </nav>
    </header>
  );
}