#!/usr/bin/env node
// Scans projects/ for project folders and writes:
//   - projects.json  (data manifest consumed by site/gallery.html)
//   - README.md      (auto-managed gallery between the BEGIN/END markers)
//
// Output is deterministic: timestamps only move when the project list actually
// changes. Otherwise CI would commit on every push and re-trigger itself.

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PROJECTS_DIR = join(ROOT, "projects");
const CATEGORIES = ["HTML", "CSS"];
const OUT = join(ROOT, "projects.json");
const README = join(ROOT, "README.md");
const BEGIN = "<!-- gallery:begin -->";
const END = "<!-- gallery:end -->";

function listProjects(category) {
  const dir = join(PROJECTS_DIR, category);
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
      const entry = ["index.html", "index.htm"].find((f) => {
        try {
          return statSync(join(abs, f)).isFile();
        } catch {
          return false;
        }
      });
      if (!entry) return null;

      const orderMatch = e.name.match(/^(\d+)[_-]/);
      return {
        folder: e.name,
        title: e.name.replace(/^\d+[_-]/, "").replace(/[-_]+/g, " ").trim(),
        category,
        order: orderMatch ? Number(orderMatch[1]) : 999,
        // URL path inside dist/, i.e. how gallery.html links to it
        url: relative(ROOT, join(abs, entry)).split(sep).join("/"),
        // Path inside the git repo, for README links
        repoPath: relative(ROOT, abs).split(sep).join("/"),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

const projects = CATEGORIES.flatMap(listProjects);
const body = JSON.stringify(projects);

function writeIfChanged(file, next) {
  let prev = null;
  try {
    prev = readFileSync(file, "utf8");
  } catch {
    /* new file */
  }
  if (prev === next) return false;
  writeFileSync(file, next);
  return true;
}

function buildReadme(list) {
  const tally = { HTML: 0, CSS: 0 };
  for (const p of list) if (tally[p.category] !== undefined) tally[p.category]++;

  const lines = [
    BEGIN,
    "",
    `**${list.length} projects** — ${tally.HTML} HTML · ${tally.CSS} CSS`,
    "",
    "| # | Project | Type | Source |",
    "| --: | :-- | :-- | :-- |",
  ];
  for (const p of list) {
    lines.push(
      `| ${p.order} | [${p.title}](${p.repoPath}/) | \`${p.category}\` | [\`index.html\`](${p.repoPath}/index.html) |`
    );
  }
  lines.push("", "Live gallery: `site/index.html` — see [Cloudflare deploy](#deploy).", "", END);

  const block = lines.join("\n");

  let readme;
  try {
    readme = readFileSync(README, "utf8");
  } catch {
    readme = "";
  }

  if (readme.includes(BEGIN) && readme.includes(END)) {
    const before = readme.slice(0, readme.indexOf(BEGIN));
    const after = readme.slice(readme.indexOf(END) + END.length);
    return before + block + after;
  }
  return block + "\n" + readme;
}

const changed = {
  manifest: writeIfChanged(
    OUT,
    JSON.stringify(
      { generatedAt: previousTimestamp(projects), count: projects.length, projects },
      null,
      2
    ) + "\n"
  ),
  readme: writeIfChanged(README, buildReadme(projects)),
};

function previousTimestamp(list) {
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8"));
    if (JSON.stringify(prev.projects) === body) return prev.generatedAt ?? new Date().toISOString();
  } catch {
    /* no previous manifest */
  }
  return new Date().toISOString();
}

console.log(`projects: ${projects.length}`);
console.log(`projects.json ${changed.manifest ? "updated" : "unchanged"}`);
console.log(`README.md ${changed.readme ? "updated" : "unchanged"}`);
for (const p of projects) console.log(`  ${p.category}/${p.folder}`);
