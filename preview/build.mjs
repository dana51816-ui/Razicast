// Builds a single self-contained HTML page of the app for mobile preview (Artifact).
// The real Next.js app is untouched; next/link and next/navigation are swapped for tiny shims.
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "preview/dist");
mkdirSync(out, { recursive: true });

const js = await build({
  entryPoints: [resolve(root, "preview/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": resolve(root, "preview/shims/next-link.tsx"),
    "next/navigation": resolve(root, "preview/shims/next-navigation.ts"),
  },
  tsconfig: resolve(root, "tsconfig.json"),
  logLevel: "error",
});

const cssSrc = readFileSync(resolve(root, "app/globals.css"), "utf8");
const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssSrc, {
  from: resolve(root, "app/globals.css"),
});

const script = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<title>Razicast Control</title>
<meta name="theme-color" content="#0b0c0f">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400..700&family=Heebo:wght@300..800&display=swap">
<style>
:root{color-scheme:dark;--font-geist:"Geist";--font-heebo:"Heebo"}
html,body{background:#0b0c0f;color:#eef0f3}
</style>
<style>${css.css}</style>
<div id="root" dir="rtl" lang="he"></div>
<script>document.documentElement.setAttribute("dir","rtl");document.documentElement.setAttribute("lang","he");</script>
<script>${script}</script>
`;
writeFileSync(resolve(out, "razicast-preview.html"), html);
console.log(`preview/dist/razicast-preview.html  ${(html.length / 1024).toFixed(0)} KB`);
