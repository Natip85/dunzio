import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ImpersonationIndicator } from "@/features/auth/impersination-indicator";
import { AppSidebar } from "@/features/nav/app-sidebar";
import { HydrateClient } from "@/trpc/server";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <SidebarProvider
        defaultLeftOpen={true}
        defaultRightOpen={false}
        className="min-h-0 flex-1"
      >
        <AppSidebar belowHeader />
        <SidebarInset className="h-auto">
          <ImpersonationIndicator />
          {children}
        </SidebarInset>
        {/* <RightSidebarContainer belowHeader /> */}
      </SidebarProvider>
    </HydrateClient>
  );
}
