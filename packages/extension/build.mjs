import { build } from "esbuild";
import { cpSync, mkdirSync, existsSync } from "fs";

const shared = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome120",
  sourcemap: false,
  minify: false,
};

// Build background service worker
await build({
  ...shared,
  entryPoints: ["src/background.ts"],
  outfile: "dist/background.js",
});

// Build popup
await build({
  ...shared,
  entryPoints: ["popup/popup.ts"],
  outfile: "dist/popup/popup.js",
});

// Copy static files
cpSync("popup/popup.html", "dist/popup/popup.html");
cpSync("popup/popup.css", "dist/popup/popup.css");
cpSync("manifest.json", "dist/manifest.json");

// Create icons directory
if (!existsSync("dist/icons")) {
  mkdirSync("dist/icons", { recursive: true });
}

// Copy user-provided icons if they exist, otherwise create placeholders
const iconSizes = [16, 48, 128];
for (const size of iconSizes) {
  const src = `icons/icon${size}.png`;
  const dst = `dist/icons/icon${size}.png`;
  if (existsSync(src)) {
    cpSync(src, dst);
  }
}

console.log("Extension built to dist/");
