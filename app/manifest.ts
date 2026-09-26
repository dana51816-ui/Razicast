import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RAZICAST CONTROL",
    short_name: "Razicast",
    description: "תמונת מצב עסקית בזמן אמת",
    start_url: "/",
    display: "standalone",
    background_color: "#efefec",
    theme_color: "#efefec",
    dir: "rtl",
    lang: "he",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
