"use client";
import { Geist, Geist_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Toaster } from "@workspace/ui/components/sonner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [typeof document !== "undefined" ? document.cookie : ""]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        {user ? (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                <h1 className="text-sm font-medium">Dashboard Overview</h1>
              </header>
              <div className="flex-1 space-y-4 p-4 pt-6">
                <Providers>
                  {children}

                  <Toaster />
                </Providers>
              </div>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          // <div className="h-[97vh] w-full flex justify-center items-center">
          <div className="flex-1 space-y-4 p-4 pt-12">
            <Providers>{children}</Providers>
          </div>
        )}
      </body>
    </html>
  );
}
