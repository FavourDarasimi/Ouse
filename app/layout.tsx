import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FavouritesProvider } from "@/context/FavouritesContext";
import { ChatProvider } from "@/context/ChatContext";
import { FloatingChat } from "@/components/chat/FloatingChat";

export const metadata: Metadata = {
  title: "Ouse — Find Your Next Home in Nigeria",
  description:
    "Browse verified rental properties across Lagos, Abuja, Port Harcourt and more. Ouse connects landlords and tenants directly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased bg-background text-text-main">
        <AuthProvider>
          <FavouritesProvider>
            <ChatProvider>
              {children}
              <FloatingChat />
            </ChatProvider>
          </FavouritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
