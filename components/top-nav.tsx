"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";

export function TopNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="h-16 bg-[#1A1D21] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
      {/* Left Side: Logo & Main Nav */}
      <div className="flex items-center gap-8 overflow-hidden">
        <Link href="/dashboard" className="text-2xl font-extrabold text-[#8B5CF6] tracking-tight shrink-0">
          JEDI.
        </Link>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          <NavLink href="/dashboard" active={isActive("/dashboard") || isActive("/create") || isActive("/calendar")}>
            Publish
          </NavLink>
          <NavLink href="/engage" active={isActive("/engage")}>
            Engage
          </NavLink>
          <NavLink href="/analyze" active={isActive("/analyze")}>
            Analyze
          </NavLink>
        </nav>
      </div>

      {/* Right Side: Actions & Profile */}
      {/* FIX: Added 'shrink-0' so this section never gets squished */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
           href="/create"
           // FIX: Added 'whitespace-nowrap' so "New Post" always stays on one line
           className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold py-2 px-4 rounded-md transition-all whitespace-nowrap"
        >
          + New Post
        </Link>
        
        <UserNav />
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
        active
          ? "border-[#8B5CF6] text-white"
          : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}