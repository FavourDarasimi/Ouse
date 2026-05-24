"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  MessageCircle,
  LayoutDashboard,
  Building2,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BottomNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const tenantLinks: BottomNavLink[] = [
  { label: "Home", href: "/tenant/dashboard", icon: Home },
  { label: "Explore", href: "/listings", icon: LayoutDashboard },
  { label: "Saved", href: "/tenant/saved", icon: Heart },
  { label: "Inbox", href: "/tenant/messages", icon: MessageCircle },
];

export const landlordLinks: BottomNavLink[] = [
  { label: "Overview", href: "/landlord/dashboard", icon: LayoutDashboard },
  { label: "My Properties", href: "/landlord/listings", icon: Building2 },
  { label: "Enquiries", href: "/landlord/messages", icon: MessageCircle },
  { label: "Explore", href: "/listings", icon: Search },
];

interface MobileBottomNavProps {
  links?: BottomNavLink[];
  unreadCount?: number;
}

export function MobileBottomNav({
  links,
  unreadCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const items = links ?? tenantLinks;

  const isActive = (href: string) => {
    if (href === "/listings") return pathname.startsWith("/listings");
    if (href === "/landlord/listings")
      return pathname.startsWith("/landlord/listings");
    if (href === "/landlord/dashboard") return pathname === href;
    if (href === "/tenant/saved") return pathname.startsWith("/tenant/saved");
    if (href === "/tenant/messages" || href === "/landlord/messages")
      return pathname.startsWith("/messages");
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
              isActive(link.href)
                ? "text-primary"
                : "text-slate-400 hover:text-text-main"
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
            {link.label === "Enquiries" && unreadCount > 0 && (
              <span className="absolute -top-0.5 right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export const TenantBottomNav = () => <MobileBottomNav links={tenantLinks} />;
export const LandlordBottomNav = () => (
  <MobileBottomNav links={landlordLinks} />
);
