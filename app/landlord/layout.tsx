import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { LandlordBottomNav } from "@/components/layout/MobileBottomNav";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.role !== "landlord") {
    redirect("/tenant/dashboard");
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-background lg:ml-64 pb-16 md:pb-0">
        {children}
      </main>
      <LandlordBottomNav />
      <Link
        href="/landlord/listings/new"
        className="fixed bottom-20 right-5 z-50 md:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-150"
        aria-label="Add listing"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </>
  );
}
