"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  MessageCircle,
  User,
  LayoutDashboard,
  List,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BottomNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const tenantLinks: BottomNavLink[] = [
  { label: "Home", href: "/tenant/dashboard", icon: Home },
  { label: "Browse", href: "/listings", icon: LayoutDashboard },
  { label: "Saved", href: "/tenant/saved", icon: Heart },
  { label: "Messages", href: "/tenant/messages", icon: MessageCircle },
];

const landlordLinks: BottomNavLink[] = [
  { label: "Dashboard", href: "/landlord/dashboard", icon: Home },
  { label: "Listings", href: "/landlord/listings", icon: List },
  { label: "Messages", href: "/landlord/messages", icon: MessageCircle },
];

export function MobileBottomNav({ links }: { links?: BottomNavLink[] }) {
  const pathname = usePathname();
  const items = links ?? tenantLinks;

  const isActive = (href: string) => {
    if (href === "/listings") return pathname.startsWith("/listings");
    if (href === "/landlord/listings")
      return pathname.startsWith("/landlord/listings");
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
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
              isActive(link.href)
                ? "text-primary"
                : "text-slate-400 hover:text-text-main"
            }`}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
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
