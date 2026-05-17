import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { DataInitializer } from "@/components/DataInitializer";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DataInitializer />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Sidebar className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto" />
        <div className="min-w-0 flex-1 space-y-8">{children}</div>
      </div>
    </AuthGuard>
  );
}
