import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Header } from "@/components/Header";

import "./globals.css";

export const metadata: Metadata = {
  title: "App Store moderation",
  description: "Review queue for Fanvue App Store listings",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background-primary text-content-primary antialiased">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
