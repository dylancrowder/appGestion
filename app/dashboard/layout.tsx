"use client";

import type React from "react";
import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useProtectedRoute } from "@/hooks/use-protectedroute";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useProtectedRoute();

  if (loading) return <div>Cargando...</div>; // opcional: skeleton o spinner

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
