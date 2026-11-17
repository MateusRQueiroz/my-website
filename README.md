# Mateus Queiroz — Portfolio

A personal portfolio built with React, TypeScript, and Vite. It opens on an
illustrated universe (Three.js with React Three Fiber): a reaching astronaut,
our galaxy at the center, and an introduction that plays when the galaxy is
selected. The sections are always one click away in the navigation bar.

## Develop

Use Node 22.12+ (Node 24 is supported) and npm.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. On Windows PowerShell, use `npm.cmd` if the
execution policy prevents running `npm.ps1`.

```sh
npm test          # behavior tests
npm run build    # TypeScript check and production build
npm run preview  # serve dist locally; not a production server
npm run test:e2e # browser journeys in headless Microsoft Edge (build first)
```

## Experience

- **Universe (`#/`)** — our galaxy centered inside an engraved astrolabe, a few
  distant galaxies, and a transparent painted astronaut (responsive WebP) reaching toward it.
  Nothing starts automatically. The galaxy is a large button; hover/focus
  brightens the engraved rings. Artwork provenance and the original generation
  prompt are in `docs/ASTRONAUT_ASSET.md`.
- **Entry** — selecting the galaxy plays the same 3.4 s camera flight on every visit.
- **Galaxy (`#/galaxy`)** — four labeled marble medallions (About, Projects,
  Experience, Contact) at fixed screen positions, each with a one-line purpose.
- **Sections** — `#/about`, `#/projects` (plus `/searchlens`, `/umarket`,
  `/utrace`, `/experiments`), `#/experience`, `#/contact`. Short summaries; details
  in disclosures. Refresh, Back/Forward, and old `#work`-style anchors work.
- **Destination travel** — a 750ms selection hold from the galaxy, then a
  2400ms flight. The veil stays light in motion, and content becomes interactive
  on arrival. A new destination cancels the previous sequence.
- **Toolkit** — a language atlas, celestial forge, Hermes relay, and scales of
  proof, all using the actual technologies. Arrow keys, Home, and End select tabs.
- **Reduced motion** — no camera travel or idle motion.
- **No WebGL** — a Canvas 2D still built from the same painted textures and shots.

## Rendering and performance

- Textures (galaxy, sky, distant galaxies, haze, rays) are painted once with
  Canvas 2D at load (`src/universe/paint.ts`), then drawn as ~20 simple meshes.
  No post-processing and no per-pixel noise at runtime.
- `frameloop="demand"`: continuous frames only while the camera moves, about
  30 fps for idle motion on the universe/galaxy views, and none on section pages.
- DPR is capped at 1.5 (1.25 on phones/low tier) and drops to 1 if moving
  frames are slow. Phones get half-size textures and fewer stars.
- Three.js loads as a separate chunk; the page and its links never wait for it.

Development only: `?debug` exposes `window.__universe.seek(t)` / `resume()` to
inspect a camera move. It is absent from production. `?slow` has been removed.
Documented diagnostics: `?nowebgl` forces the still; `?quality=low|high` forces a tier.

## Structure and editing content

| Location | Responsibility |
| --- | --- |
| `src/data/projects.ts` | Featured projects (tagline, what, my part, decision) and experiments |
| `src/data/experience.ts`, `src/data/profile.ts` | Experience, intro, links, skills, coursework |
| `src/data/destinations.ts` | Destination labels and one-line purposes |
| `src/universe/layout.ts` | Camera shots, destination positions, journey timing, projection |
| `src/universe/UniverseCanvas.tsx` | The 3D scene and camera rig (lazy chunk) |
| `src/universe/paint.ts` | The painted textures |
| `src/components/` | Navigation, astronaut, intro titles, glyphs, schematics |
| `src/views/` | Universe, Galaxy, About, Projects, Experience, Contact |
| `public/` | Favicon, final-draft resume, optimized astronaut, and locally served fonts |

Only publish claims, links, and screenshots you can verify. Replace
`public/resume.pdf` from the root `FinalDraft Resume.pdf` to update the downloadable
resume. The browser suite verifies SHA-256 equality and the download filename
`Mateus-Queiroz-Resume.pdf` for every visible resume link.

## Deploy

This repository is configured as a static Vite site. Build with `npm run build`
and publish **only `dist/`**. Dependencies are reproducible with `npm ci` after
the lockfile has been generated. The relative asset base supports deployment
under a URL subpath, including a GitHub Pages project path.

The Sites identity and static output directory are in `.openai/hosting.json`.
Use the Sites source/version deployment workflow when publishing there. The
original GitHub `origin` is preserved; deployment does not require force pushing
or replacing it. A separate ignored `.site-release/` checkout can be used to
publish only application files without including unrelated personal drafts.

For another static host, select its Vite preset or configure:

- Install: `npm ci`
- Build: `npm run build`
- Publish directory: `dist`

Before publishing to a different hostname, update the canonical URL and absolute
Open Graph URL/image metadata in `index.html`. The social image currently uses
the existing 512px monogram. Cinzel, Cormorant Garamond, and Manrope are served
locally from `public/fonts/`, with their SIL Open Font License files included.

Check the production preview, then verify the hosted URL, favicon, resume links,
project/toolkit tabs, destination navigation, and quiz. Keep the
previous deployed version available for rollback. No route rewrite is needed:
the portfolio uses hash routes, which every static host serves from `index.html`.

## Testing notes

Behavior tests cover the intro, routes, focus, project selection, contact copy,
menu dismissal, quiz, and camera geometry. Older mood utilities also retain their
unit tests; they are not part of the current universe interface. jsdom uses the
still fallback because it has no WebGL.

The Playwright suite uses an installed Microsoft Edge browser and starts/stops
its own production preview server on port 4173. It checks widths of 320, 375, 768,
and 1440 pixels, mobile navigation, the complete quiz flow, reduced motion,
interrupted travel, Back/Forward, direct links, real downloads, and renderer idle
behavior. Edge is explicitly launched with SwiftShader software WebGL; these
checks are not measurements of hardware-accelerated or physical-phone performance.
Fresh desktop and phone screenshots are in the ignored `tmp/review/` directory.

See `DEVELOPMENT_PLAN.md` for the original scope and `IMPLEMENTATION_STATUS.md`
for completion and verification details.
