"use client";
import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner"; // ✅ Import correcto de Sonner

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body>
        <main className="w-full">{children}</main>

  
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
