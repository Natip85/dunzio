import Topbar from "@/features/navigation/topbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "T3-testing",
  description: "A t3 app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Topbar />
      <main className="flex flex-1">{children}</main>
      {/* <Footer /> */}footer
    </div>
  );
}
