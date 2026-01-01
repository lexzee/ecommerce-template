import { Geist, Geist_Mono } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site_header";
import { ChatWidget } from "@/components/chat_widget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className=" font-sans antialiased min-h-screen bg-background"
      >
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">
            <Providers>{children}</Providers>
          </div>
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
