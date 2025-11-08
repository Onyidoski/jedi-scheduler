"use client"; // <--- 1. ADD THIS at the very top

import { UserNav } from "@/components/user-nav";
import { Calendar, LayoutDashboard, SquarePen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // <--- 2. Import the hook

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // <--- 3. Get the current URL path

  return (
    <div className="flex h-screen bg-[#141619] text-slate-100">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1A1D21] border-r border-white/5 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <span className="text-2xl font-extrabold text-[#8B5CF6] tracking-tight">JEDI.</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* 4. Use 'pathname' to check if this link is active */}
          <SidebarLink 
            href="/dashboard" 
            icon={<LayoutDashboard size={20} />} 
            active={pathname === "/dashboard"} 
          >
            Dashboard
          </SidebarLink>
          
          <SidebarLink 
            href="/create" 
            icon={<SquarePen size={20} />} 
            active={pathname === "/create"}
          >
            Create Post
          </SidebarLink>
          
          <SidebarLink 
            href="/calendar" 
            icon={<Calendar size={20} />} 
            active={pathname === "/calendar"}
          >
            Calendar
          </SidebarLink>
        </nav>

        <div className="p-3 m-3 bg-[#141619] rounded-xl border border-white/5">
          <UserNav />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-[#141619]">
        <header className="h-16 border-b border-white/10 bg-[#1A1D21] flex items-center px-6 md:hidden">
           <span className="font-extrabold text-violet-500">JEDI.</span>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper Component (Unchanged, just here for completeness)
function SidebarLink({
  href,
  icon,
  children,
  active = false
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active 
          ? "bg-white/10 text-white font-medium" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-[#8B5CF6]" : "text-slate-500 group-hover:text-slate-300"}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}