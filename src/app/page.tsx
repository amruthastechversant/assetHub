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

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return <ScannerDashboard />;
  }

  return <LoginPage />;
}
