import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Hebrew, Karantina, Poppins } from "next/font/google";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RaziCast Control",
  description: "תמונת מצב עסקית בזמן אמת",
  applicationName: "RaziCast Control",
  appleWebApp: { capable: true, title: "RaziCast", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // Older iOS reads only the Apple tag for full-screen home-screen launch
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#efefec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${plex.variable} ${karantina.variable} ${poppins.variable}`}>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
