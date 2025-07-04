import { FilmDataProvider } from "@/contexts/film-data-context";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Camera } from "lucide-react";

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
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                        <Camera className="h-6 w-6" />
                        <span className="font-headline text-lg font-semibold">Kobiyama</span>
                    </div>
                </header>
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </FilmDataProvider>
  )
}
