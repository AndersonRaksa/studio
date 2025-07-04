import { FilmDataProvider } from "@/contexts/film-data-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilmDataProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
            <AppSidebar />
            <SidebarInset>
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </FilmDataProvider>
  )
}
