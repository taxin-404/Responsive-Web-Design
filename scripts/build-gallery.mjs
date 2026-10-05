#!/usr/bin/env node
// Scans HTML/ and CSS/ for project folders and writes projects.json,
// which gallery.html renders. Run by .github/workflows/gallery.yml on every push.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const CATEGORIES = ["HTML", "CSS"];
const OUT = join(ROOT, "projects.json");

function listProjects(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const abs = join(dir, e.name);
      const hasEntry = ["index.html", "index.htm"]
        .some((f) => {
          try {
            return statSync(join(abs, f)).isFile();
          } catch {
            return false;
          }
        });
      if (!hasEntry) return null;

      const orderMatch = e.name.match(/^(\d+)[_-]/);
      const slug = e.name.replace(/^\d+[_-]/, "").replace(/[-_]+/g, " ").trim();

      return {
        folder: e.name,
        title: slug,
        category: relative(ROOT, dir).split(sep)[0],
        order: orderMatch ? Number(orderMatch[1]) : 999,
        url: relative(ROOT, join(abs, "index.html")).split(sep).join("/"),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

const projects = CATEGORIES.flatMap((c) => listProjects(join(ROOT, c)));

// Keep the previous timestamp when the project list is unchanged, so re-running
// produces a byte-identical file. Otherwise the workflow would commit on every
// push and re-trigger itself forever.
let generatedAt = new Date().toISOString();
try {
  const prev = JSON.parse(readFileSync(OUT, "utf8"));
  if (JSON.stringify(prev.projects) === JSON.stringify(projects)) {
    generatedAt = prev.generatedAt ?? generatedAt;
    console.log("projects.json unchanged");
  }
} catch {
  // no previous manifest
}

writeFileSync(OUT, JSON.stringify({ generatedAt, count: projects.length, projects }, null, 2) + "\n");
console.log(`projects.json: ${projects.length} projects`);
for (const p of projects) console.log(`  ${p.category}/${p.folder} -> ${p.url}`);
