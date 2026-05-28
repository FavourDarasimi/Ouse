"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";

export function ListingSidebarLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const isLandlord = role === "landlord";

  return (
    <>
      {isLandlord && <Sidebar />}
      <div className={isLandlord ? "lg:ml-72 transition-all duration-300" : ""}>
        {children}
      </div>
    </>
  );
}
