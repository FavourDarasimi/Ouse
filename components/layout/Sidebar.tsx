"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  MessageCircle,
} from "lucide-react";
import { getInitials } from "@/lib/utils/getInitials";
import { Logo } from "@/components/shared/Logo";

interface SidebarProps {
  profile?: { full_name?: string | null } | null;
  unreadCount?: number;
}

const navLinks = [
  { label: "Overview", href: "/landlord/dashboard", icon: LayoutDashboard },
  { label: "My Properties", href: "/landlord/listings", icon: Building2 },
  { label: "Enquiries", href: "/landlord/messages", icon: MessageCircle },
];

export function Sidebar({ profile, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/landlord/dashboard") return pathname === href;
    if (href === "/landlord/listings")
      return pathname.startsWith("/landlord/listings");
    if (href === "/landlord/messages")
      return pathname.startsWith("/landlord/messages");
    return pathname === href;
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed left-0 top-0 bottom-0 hidden lg:flex lg:flex-col w-72 bg-white border-r border-slate-100 z-40 px-4 py-6"
    >
      <div className="mb-10">
        <Logo href="/landlord/dashboard" size="lg" />
      </div>

      <nav className="flex flex-col gap-1 space-y-5">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <motion.div key={link.href} whileTap={{ scale: 0.98 }}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-full w-full ${
                  active
                    ? "font-medium text-white bg-primary shadow-xl"
                    : "text-slate-500 hover:bg-slate-50 hover:text-text-main transition-all duration-150"
                }`}
              >
                <link.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="text-base">{link.label}</span>
                {link.label === "Enquiries" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors duration-150">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {getInitials(profile?.full_name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-main truncate">
            {profile?.full_name || "User"}
          </p>
          <p className="text-xs text-slate-400">Landlord</p>
        </div>
      </div>
    </motion.aside>
  );
}
