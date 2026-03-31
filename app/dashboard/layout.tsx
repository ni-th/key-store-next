import Sidebar from "@/components/ui/admin/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <div className="grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
        <Sidebar />
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}