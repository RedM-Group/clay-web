import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: { default: "clay", template: "%s · clay" },
  description: "Turn every drive into your next deal. Capture properties, research ownership, map routes, and manage your off-market real estate pipeline with Clay.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "clay", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#17191C" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
