import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Hebrew, Karantina } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const plex = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});
const karantina = Karantina({
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
  variable: "--font-karantina",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAZICAST CONTROL",
  description: "תמונת מצב עסקית בזמן אמת",
  applicationName: "Razicast Control",
  appleWebApp: { capable: true, title: "Razicast", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#efefec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${plex.variable} ${karantina.variable}`}>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
