"use client";

import { TopNav } from "@/components/top-nav";
import { Calendar, Facebook, Instagram, LayoutDashboard, SquarePen, Youtube } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen bg-[#141619] text-slate-100 overflow-hidden">
      
      {/* 1. TOP NAVIGATION */}
      <TopNav />

      {/* 2. LOWER AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#1A1D21] border-r border-white/5 hidden md:flex flex-col overflow-y-auto">
           
           {/* SECTION 1: Publishing Tools */}
           <div className="pt-6 px-3">
             <h2 className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
               Publishing
             </h2>
             <div className="space-y-1">
              <SidebarLink 
                href="/dashboard" 
                icon={<LayoutDashboard size={18} />} 
                active={pathname === "/dashboard"}
              >
                Dashboard
              </SidebarLink>
              <SidebarLink 
                href="/calendar" 
                icon={<Calendar size={18} />} 
                active={pathname === "/calendar"}
              >
                Calendar
              </SidebarLink>
              <SidebarLink 
                href="/create" 
                icon={<SquarePen size={18} />} 
                active={pathname === "/create"}
              >
                Create Post
              </SidebarLink>
             </div>
           </div>

           {/* SECTION 2: Channels (Connect) */}
           <div className="pt-8 px-3 pb-6 flex-1">
             <h2 className="mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
               Channels
             </h2>
             <div className="space-y-1">
              <SidebarLink 
                href="/connect/instagram" 
                icon={<Instagram size={18} />} 
                active={pathname === "/connect/instagram"}
              >
                Connect Instagram
              </SidebarLink>
              
              {/* NEW: Using the custom TikTok Icon here */}
              <SidebarLink 
                href="/connect/tiktok" 
                icon={<TikTokIcon size={18} />} 
                active={pathname === "/connect/tiktok"}
              >
                Connect TikTok
              </SidebarLink>
              
              <SidebarLink 
                href="/connect/youtube" 
                icon={<Youtube size={18} />} 
                active={pathname === "/connect/youtube"}
              >
                Connect YouTube
              </SidebarLink>
              <SidebarLink 
                href="/connect/facebook" 
                icon={<Facebook size={18} />} 
                active={pathname === "/connect/facebook"}
              >
                Connect Facebook
              </SidebarLink>
             </div>
           </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#141619] p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper for sidebar links
function SidebarLink({ href, icon, children, active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
        active 
          ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" 
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <span className={active ? "text-[#8B5CF6]" : "text-slate-500 group-hover:text-slate-400 transition-colors"}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}

// --- CUSTOM TIKTOK ICON COMPONENT ---
function TikTokIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}