import { SiteHeader } from "@/components/site/site-header";

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
