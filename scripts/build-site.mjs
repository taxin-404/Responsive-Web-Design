#!/usr/bin/env node
// Assembles the deployable static site into dist/ :
//
//   site/*            -> dist/
//   projects/*        -> dist/projects/
//   projects.json     -> dist/projects.json
//
// Cloudflare Pages settings:
//   Build command:      node scripts/build-site.mjs
//   Build output dir:   dist
//
// Keeping this dependency-free means the same script runs locally, in CI, and
// on Cloudflare without an install step.

import { cpSync, mkdirSync, readFileSync, rmSync, statSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// site pages
cpSync(join(ROOT, "site"), DIST, { recursive: true });

// project folders
const projectsSrc = join(ROOT, "projects");
try {
  statSync(projectsSrc);
  cpSync(projectsSrc, join(DIST, "projects"), { recursive: true });
} catch {
  console.warn("warn: no projects/ directory");
}

// manifest
try {
  copyFileSync(join(ROOT, "projects.json"), join(DIST, "projects.json"));
} catch {
  console.warn("warn: no projects.json (run build-gallery.mjs first)");
}

// verify every manifest entry resolves inside dist
let broken = 0;
let total = 0;
try {
  const manifest = JSON.parse(readFileSync(join(DIST, "projects.json"), "utf8"));
  total = manifest.projects?.length ?? 0;
  for (const p of manifest.projects ?? []) {
    try {
      statSync(join(DIST, p.url));
    } catch {
      console.error(`broken: ${p.url}`);
      broken++;
    }
  }
} catch (err) {
  console.error(`manifest check skipped: ${err.message}`);
}

console.log(`dist/ ready — ${total} projects${broken ? `, ${broken} broken` : ""}`);
if (broken) process.exitCode = 1;
