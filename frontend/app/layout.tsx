import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/layout/ToastProvider";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RemitFlow",
  description: "RemitFlow routes cross-border payments through the strongest Stellar anchor corridors.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>
          <div className="mx-auto flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">{children}</main>
            <Footer />
          </div>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
