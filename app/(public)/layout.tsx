import { Navbar } from "@/components/layout/Navbar";
import { ConditionalBottomNav } from "@/components/layout/ConditionalBottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <ConditionalBottomNav />
    </>
  );
}
