import type { Metadata, Viewport } from "next";
import { Exo, Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  applicationName: "Instant",

  title: {
    default: "Instant",
    template: "%s | Instant",
  },

  description: "Instant device asset management",

  icons: {
    icon: "/icon.svg",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Instant",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${exo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AuthProvider>{children}</AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
