import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RaziCast Control",
    short_name: "RaziCast",
    description: "תמונת מצב עסקית בזמן אמת",
    start_url: "/",
    display: "standalone",
    background_color: "#efefec",
    theme_color: "#efefec",
    dir: "rtl",
    lang: "he",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
