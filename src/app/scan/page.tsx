import { Metadata } from "next";
import InstantScanExperience from "@/components/scanner/InstantScanExperience";

export const metadata: Metadata = {
  title: "AssetHub Scanner — Asset Details & Authenticator",
  description:
    "Scan asset QR codes to inspect role-authorized device specifications, or scan authenticator QR codes to generate one-time passwords.",
};

export default function ScanPage() {
  return <InstantScanExperience />;
}
