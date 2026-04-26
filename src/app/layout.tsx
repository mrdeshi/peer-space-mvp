import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peer Space",
  description: "Connetti, impara, migliora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="antialiased" style={{
        fontFamily: "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
