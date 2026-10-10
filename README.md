# Responsive Web Design

Personal collection of freeCodeCamp responsive-web-design projects — plain HTML and CSS, no frameworks.

**Live site: https://responsive-web-design.taxin.workers.dev**

The gallery on the repo home page and the deployed site are generated from whatever
folders exist under [`projects/`](projects/). Add a folder, push, and it shows up on its own.

## Layout

```
README.md            this file (gallery table is auto-generated)
site/index.html      the gallery page — deployed at /
projects/HTML/       HTML-only projects
projects/CSS/        HTML + CSS projects
scripts/             build-gallery.mjs (manifest + README), build-site.mjs (dist)
projects.json        generated manifest consumed by the gallery
wrangler.toml        Cloudflare Worker config — assets come from dist/
dist/                build output (gitignored, never committed)
```

## Adding a project

1. Create `projects/<HTML|CSS>/<n>_<Project_Name>/index.html`
   (`styles.css` alongside it if the project has CSS.)
2. `node scripts/build-gallery.mjs` — regenerates `projects.json` and the table below.
3. Push. The GitHub Action runs the same script, and Cloudflare rebuilds `dist/`.

Naming matters: the leading number sets the gallery order, so use `1_`, `2_`, `3_`…

## Deploy

Cloudflare Workers (Git-connected), from this repo:

| Setting | Value |
| :-- | :-- |
| Build command | `node scripts/build-gallery.mjs && node scripts/build-site.mjs` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `.` (repo root — `wrangler.toml` must be reachable) |

The build command assembles `dist/`, then wrangler uploads **only** `dist/` as Worker
assets. Zero dependencies: plain `node` plus `npx` fetching wrangler on demand.

## Gallery

<!-- gallery:begin -->

**11 projects** — 4 HTML · 7 CSS

| # | Project | Type | Source |
| --: | :-- | :-- | :-- |
| 1 | [Build a Curriculum Outline](projects/HTML/1_Build_a_Curriculum_Outline/) | `HTML` | [`index.html`](projects/HTML/1_Build_a_Curriculum_Outline/index.html) |
| 2 | [Debug Camperbot's Profile Page](projects/HTML/2_Debug_Camperbot's_Profile_Page/) | `HTML` | [`index.html`](projects/HTML/2_Debug_Camperbot's_Profile_Page/index.html) |
| 3 | [Debug a Pet Adoption Page](projects/HTML/3_Debug_a_Pet_Adoption_Page/) | `HTML` | [`index.html`](projects/HTML/3_Debug_a_Pet_Adoption_Page/index.html) |
| 4 | [Build a Cat Photo App](projects/HTML/4_Build_a_Cat_Photo_App/) | `HTML` | [`index.html`](projects/HTML/4_Build_a_Cat_Photo_App/index.html) |
| 1 | [Design a Cafe Menu](projects/CSS/1_Design_a_Cafe_Menu/) | `CSS` | [`index.html`](projects/CSS/1_Design_a_Cafe_Menu/index.html) |
| 2 | [Design a Business Card](projects/CSS/2_Design_a_Business_Card/) | `CSS` | [`index.html`](projects/CSS/2_Design_a_Business_Card/index.html) |
| 3 | [Build a Stylized To Do list](projects/CSS/3_Build_a_Stylized_To-Do_list/) | `CSS` | [`index.html`](projects/CSS/3_Build_a_Stylized_To-Do_list/index.html) |
| 4 | [Design a Blog Post Card](projects/CSS/4_Design_a_Blog_Post_Card/) | `CSS` | [`index.html`](projects/CSS/4_Design_a_Blog_Post_Card/index.html) |
| 5 | [Build an Event Flyer Page](projects/CSS/5_Build_an_Event_Flyer_Page/) | `CSS` | [`index.html`](projects/CSS/5_Build_an_Event_Flyer_Page/index.html) |
| 6 | [Design a Greeting Card](projects/CSS/6_Design_a_Greeting_Card/) | `CSS` | [`index.html`](projects/CSS/6_Design_a_Greeting_Card/index.html) |
| 7 | [Design a Parent Teacher Conference Form](projects/CSS/7_Design_a_Parent_Teacher_Conference_Form/) | `CSS` | [`index.html`](projects/CSS/7_Design_a_Parent_Teacher_Conference_Form/index.html) |

Live: **https://responsive-web-design.taxin.workers.dev** — see [Cloudflare deploy](#deploy).

<!-- gallery:end -->

## Deploy notes

`dist/` = `site/` + `projects/` + `projects.json`, so live URLs are `/` (the gallery),
`/projects.json`, and `/projects/{HTML,CSS}/…`. Paths that existed at the old repo
root (`/README.md`, `/scripts/…`, `/.git/…`) are deliberately not served.

Never deploy with `wrangler.toml` removed or `assets.directory` pointed at the repo
root — that would publish the `.git` directory. The committed `wrangler.toml` is what
prevents it.
