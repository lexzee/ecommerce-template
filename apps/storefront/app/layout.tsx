import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site_header";
import { ChatWidget } from "@/components/chat_widget";
import { Toaster } from "@workspace/ui/components/sonner";
import { siteConfig } from "@/config/site";
import { cn } from "@workspace/ui/lib/utils";
import { Footer } from "@/components/layout/footer";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            {/* Removed 'lg:mx-72'. 
              The pages themselves (e.g., page.tsx) use 'container' to center content.
              This allows you to have full-width sections (like hero banners) if needed.
            */}
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          <ChatWidget />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
