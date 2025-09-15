import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
