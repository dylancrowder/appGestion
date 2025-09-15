import { ChevronUp, Home, DollarSign, PersonStanding, Search, Settings, User2, ShoppingCart, Users, PackagePlus, ChevronDown, User, LogOut } from "lucide-react"
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
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar } from "./ui/avatar"
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"

export const items = [
  { title: "Punto de venta", url: "/dashboard", icon: ShoppingCart },
  { title: "Gestión de empleados", url: "/dashboard/employers", icon: Users },
  { title: "Ventas", url: "/dashboard/sales", icon: DollarSign },
  { title: "Crear Producto", url: "/dashboard/products/new", icon: PackagePlus },
]

export function AppSidebar() {
  return (
    <Sidebar>
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

      {/* Footer con menú de usuario */}
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded transition">
            <div className="flex items-center gap-3">
            <Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
              <span className="font-medium">Usuario</span>
            </div>
            <ChevronDown className="ml-auto transition-transform duration-200 data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
    </Sidebar>
  )
}
