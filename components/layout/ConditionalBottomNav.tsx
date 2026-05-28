"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TenantBottomNav, LandlordBottomNav } from "./MobileBottomNav";

export function ConditionalBottomNav() {
  const { user, role } = useAuth();
  const pathname = usePathname();

  if (!pathname.startsWith("/listings")) return null;
  if (!user || role === null) return null;

  if (role === "landlord") return <LandlordBottomNav />;
  return <TenantBottomNav />;
}
