"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ShoppingCart, PackagePlus, User, Settings, LogOut, Sun } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

export const items = [
  { title: "Compras", url: "/dashboard/", icon: ShoppingCart },
  { title: "Gastos", url: "/dashboard/gestion", icon: PackagePlus },
];

export function AppSidebar() {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  // Actualizamos fecha y hora cada minuto
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDate(now.toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric" }));
      setTime(now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulamos clima
  const weather = {
    temp: "25°C",
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    description: "Soleado",
  };

  return (
    <Sidebar>
      {/* Navbar usuario arriba */}
      <div className="px-3 py-4 border-b border-gray-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto flex items-center gap-2 text-sm font-medium hover:text-gray-700 transition">
                Usuario
                <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" /> <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                <LogOut className="w-4 h-4" /> <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Fecha y clima */}
        <div className="flex flex-col mt-2 text-sm text-gray-600">
          <span>{date}</span>
          <span className="flex items-center gap-1">
            {weather.icon} {weather.temp} - {weather.description}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a className="flex items-center gap-2" href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer opcional */}
      <SidebarFooter className="p-2 text-center text-xs text-gray-400">
        © 2025 Tu App
      </SidebarFooter>
    </Sidebar>
  );
}
