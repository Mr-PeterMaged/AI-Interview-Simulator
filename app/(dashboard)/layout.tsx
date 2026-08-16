import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopNavigation } from "@/components/dashboard/top-navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <TopNavigation />
          <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
