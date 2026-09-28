import { Metadata } from "next";
import { auth } from "@/auth";
import { LoginPage } from "@/components/auth/LoginPage";
import ScannerDashboard from "@/components/scanner/ScannerDashboard";

export const metadata: Metadata = {
  title: "Instant",
  description:
    "Instant — Scan asset QR codes to inspect specifications, and manage Time-based 2FA authenticators.",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (session?.user) {
    const resolvedParams = await searchParams;
    const tabParam = resolvedParams.tab;
    const initialTab =
      typeof tabParam === "string" && ["scanner", "recent", "authenticators"].includes(tabParam)
        ? (tabParam as "scanner" | "recent" | "authenticators")
        : undefined;

    return <ScannerDashboard initialTab={initialTab} />;
  }

  return <LoginPage />;
}
