// Builds the user guide PDF:
//   1. walks the running app (http://localhost:3000) on an iPhone-sized browser and takes screenshots
//   2. prints docs/guide/guide.html to A4 PDF with local fonts
//
// Usage: node docs/guide/build.mjs <fonts-dir> <out.pdf> [base-url]
//   <fonts-dir> holds IBM Plex Sans Hebrew (400/500/600/700) and Karantina (700) woff2 files from @fontsource:
//   plex-{400,500,600,700}.woff2 + plex-latin-{400,500,600,700}.woff2 (hebrew / latin subsets), karantina-700.woff2 + karantina-latin-700.woff2
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium, devices } = require(join(execSync("npm root -g").toString().trim(), "playwright"));

const [fontsDir, outPdf, base = "http://localhost:3000"] = process.argv.slice(2);
if (!fontsDir || !outPdf) throw new Error("usage: node docs/guide/build.mjs <fonts-dir> <out.pdf> [base-url]");
const img = join(here, "img");
mkdirSync(img, { recursive: true });

const browser = await chromium.launch();

/* ── 1. Screenshots ── */
const ctx = await browser.newContext({ ...devices["iPhone 14 Pro"], deviceScaleFactor: 2 });
const p = await ctx.newPage();
const wait = (ms = 500) => p.waitForTimeout(ms);
const shot = (name) => p.screenshot({ path: join(img, `${name}.png`) });
const tap = async (name) => {
  await p.getByRole("button", { name, exact: true }).or(p.getByRole("radio", { name, exact: true })).first().click();
  await wait(450);
};

// The demo data lives in September 2026: pin the app's "today" there (kept for the session)
await p.goto(`${base}/?today=2026-09-26`, { waitUntil: "networkidle" });
await p.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await p.reload({ waitUntil: "networkidle" });
await wait(1500); // mid-intro
await shot("intro");
await wait(3200);

// New instructor
await p.locator('section[aria-label="הוספה מהירה"]').getByRole("button", { name: "מדריך" }).click();
await wait(600);
await p.getByLabel("שם", { exact: true }).fill("נועה");
await p.getByLabel("טלפון").fill("052-555-0147");
await tap("המשך");
await tap("לפי קבוצה");
await wait(300);
await p.getByLabel("סכום לקבוצה").fill("110");
await tap("+ תוספת נסיעה (לא חובה)");
await p.getByLabel("תוספת נסיעה", { exact: true }).fill("50");
await tap("המשך");
await tap("כן");
await wait(400);
await shot("instructor-review");
await tap("הוסף מדריך");

// New framework, then activity
await tap("מסגרת חדשה");
await p.getByLabel("שם המסגרת או הלקוח").fill("בית ספר אוסישקין");
await tap("המשך");
await tap("בית ספר");
await tap("לפי קבוצה");
await wait(300);
await p.getByLabel("תעריף לקוח לקבוצה").fill("250");
await tap("המשך");
await tap("בלי. לפי התעריף של כל מדריך");
await tap("הוסף מסגרת");
await tap("פעילות במסגרת הזו");
await p.getByRole("button", { name: /^נ\s*נועה/ }).first().click();
await wait(700);
for (let i = 0; i < 5; i++) await p.getByRole("button", { name: "הוספה לקבוצות" }).click();
await tap("לחישוב");
await wait(500);
await shot("activity-review");
await tap("שמור פעילות");
await wait(1600);
await tap("סיום");
await wait(800);

// Home after the journey
await p.evaluate(() => window.scrollTo(0, 0));
await wait(1600);
await shot("home");

// Activity card: open the newest activity from the month log
await p.goto(`${base}/month`, { waitUntil: "networkidle" });
await wait(1500);
await shot("month");
await p.getByRole("button", { name: /^נועה/ }).first().click();
await wait(800);
await shot("activity-detail");
await p.keyboard.press("Escape");
await wait(400);

// Team + frameworks
await p.goto(`${base}/team`, { waitUntil: "networkidle" });
await wait(1600);
await shot("team");
await p.getByRole("tab", { name: "מסגרות" }).click();
await wait(900);
await shot("frameworks");

// Instructor with a missing receipt
await p.goto(`${base}/instructor?id=tzah`, { waitUntil: "networkidle" });
await wait(1400);
await p.evaluate(() => window.scrollTo(0, 420));
await wait(500);
await shot("instructor");

// Backup sheet
await p.goto(base, { waitUntil: "networkidle" });
await wait(1500);
await p.getByRole("button", { name: /גיבוי$/ }).first().click();
await wait(900);
await shot("backup");
await ctx.close();

/* ── 2. PDF ── */
const HE = "U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F";
const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const font = (family, file, weight, range) =>
  `@font-face{font-family:"${family}";src:url("file://${resolve(fontsDir, file)}") format("woff2");font-weight:${weight};font-display:block;unicode-range:${range}}`;
const fonts = [
  ...[400, 500, 600, 700].flatMap((w) => [font("Plex", `plex-${w}.woff2`, w, HE), font("Plex", `plex-latin-${w}.woff2`, w, LATIN)]),
  font("Karantina", "karantina-700.woff2", 700, HE),
  font("Karantina", "karantina-latin-700.woff2", 700, LATIN),
].join("\n");
const html = readFileSync(join(here, "guide.html"), "utf8").replace("/*FONTS*/", fonts);
const tmp = join(here, ".guide.build.html");
writeFileSync(tmp, html);
const page = await browser.newPage();
await page.goto(`file://${tmp}`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: outPdf, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("wrote", outPdf);
