"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  Package,
  Search,
  Wallet,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

export const items = [
  { title: "Inventario", url: "/dashboard", icon: Package },
  { title: "Análisis de productos", url: "/dashboard/analysis", icon: Search },
  { title: "Finanzas", url: "/dashboard/finances", icon: Wallet },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Para detectar ruta actual
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("name");

    toast({
      title: "👋 Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });

    router.push("/login");
  };

  return (
    <Sidebar className="h-screen flex flex-col border-r">
      {/* Header usuario */}
      <div className="px-3 py-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full gap-3 rounded-full px-3 py-2 hover:bg-muted transition cursor-pointer">
              {/* Avatar */}
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-sm">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-primary text-white font-medium">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              {/* Nombre a la derecha, pegado a la flecha */}
              <div className="flex-1 flex justify-end items-center gap-1 truncate">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {userName || "Usuario"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="w-56 rounded-xl shadow-lg"
          >
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted cursor-pointer">
              <User className="w-4 h-4 text-primary" /> <span>Mi perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 hover:bg-muted cursor-pointer">
              <Settings className="w-4 h-4 text-primary" /> <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contenido principal con scroll */}
      <SidebarContent className="flex-1 overflow-y-auto px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Normaliza rutas quitando barra final
                const normalizedPath = pathname.replace(/\/$/, "");
                const normalizedItemUrl = item.url.replace(/\/$/, "");

                let isActive = false;

                if (item.url === "/dashboard") {
                  // Inventario activo solo en /dashboard exacto
                  isActive = normalizedPath === normalizedItemUrl;
                } else {
                  // Otros items activos si la ruta empieza con su URL
                  isActive = normalizedPath.startsWith(normalizedItemUrl);
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition
                          ${isActive ? "bg-primary/20 text-primary font-semibold" : "hover:bg-muted text-gray-800"}
                        `}
                        href={item.url}
                      >
                        <item.icon
                          className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-gray-600"}`}
                        />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t text-center text-xs text-gray-400">
        © 2025 App Gestión
      </SidebarFooter>
    </Sidebar>
  );
}
