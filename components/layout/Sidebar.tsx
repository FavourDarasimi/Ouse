"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, List, MessageCircle, Search } from "lucide-react";

const sidebarLinks = [
  { label: "Overview", href: "/landlord/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/landlord/listings", icon: List },
  { label: "Inbox", href: "/landlord/messages", icon: MessageCircle },
  { label: "Explore", href: "/listings", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/landlord/listings") {
      return (
        pathname.startsWith("/landlord/listings") && !pathname.endsWith("/new")
      );
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-100 z-40">
      <div className="p-4">
        <Link
          href="/landlord/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-secondary"
        >
          <Home className="h-5 w-5 text-primary" />
          Ouse
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
              isActive(link.href)
                ? "bg-primary/5 text-primary"
                : "text-text-main hover:bg-slate-50"
            }`}
          >
            <link.icon className="h-4 w-4 text-slate-400" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
