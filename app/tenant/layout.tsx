import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { TenantBottomNav } from "@/components/layout/MobileBottomNav";

export default async function TenantLayout({
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

  if (profile && profile.role !== "tenant") {
    redirect("/landlord/dashboard");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <TenantBottomNav />
    </>
  );
}
