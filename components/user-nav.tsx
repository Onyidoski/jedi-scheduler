"use client";

import { createClient } from "@/lib/supabase/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, CreditCard, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="group flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors outline-none">
          {/* Avatar Circle - Violet to pop against dark bg */}
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center shrink-0">
             <User className="w-4 h-4 text-white" />
          </div>
          
          {/* Email Text */}
          <div className="flex-1 text-left hidden lg:block overflow-hidden">
            <p className="text-xs text-slate-400 font-medium truncate">
               {userEmail || "Loading..."}
            </p>
          </div>
          
          {/* Chevron */}
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180 hidden lg:block shrink-0 opacity-50 group-hover:opacity-100" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-64 bg-[#1A1D21] rounded-xl shadow-2xl border border-white/10 p-2 z-50 animate-in fade-in-80 zoom-in-95 text-slate-200 ml-4"
          sideOffset={5}
          align="start"
        >
          {/* Header */}
          <div className="px-3 py-2.5 text-sm border-b border-white/5 mb-2">
            <p className="font-medium text-white">My Account</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <DropdownMenuItem href="/settings" icon={<Settings className="w-4 h-4" />}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem href="/billing" icon={<CreditCard className="w-4 h-4" />}>
              Billing
            </DropdownMenuItem>
          </div>
          
          <DropdownMenu.Separator className="h-px bg-white/5 my-2" />
          
          <DropdownMenu.Item
            onSelect={handleSignOut}
            className="flex cursor-default select-none items-center rounded-lg px-3 py-2.5 text-sm text-red-400 outline-none hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Helper for consistent menu items
function DropdownMenuItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link 
        href={href} 
        className="flex cursor-default select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 outline-none hover:bg-white/5 hover:text-white transition-colors"
      >
        <span className="text-slate-500 group-hover:text-white">{icon}</span>
        <span>{children}</span>
      </Link>
    </DropdownMenu.Item>
  );
}