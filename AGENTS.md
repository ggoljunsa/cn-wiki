<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-25 | Updated: 2026-10-04 -->

# 위키 (컴네위키, CN Wiki)

## Purpose
A self-contained, 나무위키-style single-page study wiki for CSE403 Computer Network midterm scope (CH01 Introduction, CH02 Physical Layer (1)(2)(3), CH03 Data-Link Layer (1)(2), CH04 Local Area Networks (1) — L7, added 2026-10-04). It is its **own git repository** (remote `github.com/ggoljunsa/cn-wiki`, live at https://ggoljunsa.github.io/cn-wiki/), nested inside the OneDrive course folder. Everything the reader sees is generated into `index.html` from `src/` by `build.py`. Built 2026-09-25 from the 운체위키 template following `../../../_위키_개발지침.md`.

Three kinds of "visual" content exist, and each has its own syntax and engine:

| Kind | Syntax in `.wiki` | Source | Engine |
|---|---|---|---|
| Real slide capture | `[[img:L5-46.png\|캡션\|large]]` | `_slides/` → copied to `images/` | none (plain `<figure>`) |
| Step simulator (debugger-style) | `[[sim:crc_division]]` | `src/sims/*.js` (18) | `src/sims/_engine.js` (SimEngine) |
| Animated diagram (SVG+SMIL) | `[[anim:csma_cd_abort\|캡션]]` | `src/anims/*.js` (23) | `src/anims/_anim_engine.js` (AnimEngine) |

## Key Files
| File | Description |
|------|-------------|
| `build.py` | `src/*` → `index.html`. Copies only referenced slide PNGs into `images/`, reports broken `[[links]]`, missing `[[sim:]]`/`[[anim:]]`, unused anims. Exit 1 only on a malformed article header. |
| `index.html` | **Generated. Never edit by hand.** CSS + article data + all engines inline (~1.2 MB). |
| `shot.sh` | `./shot.sh <anim> <sec> [out.png]` — headless-Chrome screenshot of one animation frozen at a time. Fresh `--user-data-dir` per run + 40 s watchdog. |
| `README.md` | Human-facing overview, build commands, source attribution. |
| `.gitignore` | Excludes `.omc/`, `_slides/`, `_text/`, `.DS_Store`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All authored sources: contract, CSS/layout, renderer, articles (262), sims (20), anims (27), tests (see `src/AGENTS.md`) |
| `images/` | Build output: slide captures actually referenced by articles (see `images/AGENTS.md`) |
| `_slides/` | Slide PNG originals `L{덱}-{pp}.png`. Git-ignored; regenerate with `pdftoppm -r 90 -png "../강의자료/<pdf>" _slides/L<n>` — on Windows without poppler use PyMuPDF: `py -3.12 -c "import fitz; ...page.get_pixmap(dpi=90).save(...)"` (deck table in `src/CONTRACT.md` §1). |
| `_text/` | `pdftotext -layout` output per deck. Git-ignored. |
| `.omc/` | oh-my-claudecode runtime state. Ignore. |

## For AI Agents

### Working In This Directory
- Read `src/CONTRACT.md` before writing anything; it is the authority on syntax, canonical article keys (§5), the sim API (§6) and the anim API (§7).
- Edit sources under `src/`, then run `python3 build.py`. Commit both sources and the regenerated `index.html` (GitHub Pages serves `index.html` directly).
- New material arriving in the course folder (recording, quiz, homework, new slide deck) should be reflected here first, then in `../정리본/`. A new deck = new `L7` in `_slides/`/`_text/`, new §5 keys, new main article `90_…`.
- Prose is Korean with English technical terms untranslated, exactly as the professor says them.

### Testing Requirements
```sh
python3 build.py                       # must end with BUILD OK, broken links 0, missing 0
node src/test_sims.js                  # every sim × every option combo
node src/test_anims.js                 # every anim: contract + tag balance + timing
node src/test_render.js index.html     # all articles render with no raw markup left
./shot.sh <anim> <sec> out.png         # then open the PNG and look at it
```
Phone-width check: headless Chrome ignores `--window-size=420`; use DevTools `Emulation.setDeviceMetricsOverride` (a `measure.mjs` pattern: list elements whose `getBoundingClientRect().right` exceeds the viewport, excluding `.tablewrap`, `pre`, `svg`, `.katex-mathml`).
Debug URLs: `index.html?anim=NAME&animt=SEC` renders one animation paused; `index.html?animt=SEC#문서키` freezes every animation in a document.

### Common Patterns
- One article per file, `src/articles/{정렬번호}_{key}.wiki`; the `key` header is what `[[key]]` links resolve to.
- Sims and anims are pure data + `build()`; no DOM access (tests run them under node without `document`).
- Rebuild and re-screenshot after every visual change; do not trust the source alone.

## Dependencies

### Internal
- `../강의자료/*.pdf` — source of slide captures and facts.
- `../정리본/*.md`, `../녹음본/*.txt`, `../내가만드는문제/`, `../../노트북lm_문제푼거/` — content reused in articles and `{exam}`/`{warn}` boxes.

### External
- Python 3 (build), Node ≥ 22 (tests, measure.mjs uses global WebSocket), Google Chrome (screenshots), poppler `pdftoppm`/`pdftotext` (slides).
- KaTeX 0.16 from jsDelivr at runtime for `$…$` math; no other runtime dependency.
- Offline/PWA (2026-09-30): `build.py` also writes `sw.js` (service worker, cache name `wiki-<hash>`) and `manifest.webmanifest`; `head.html` has the 📥 오프라인 저장 button. `test_render.js` therefore takes the **last** inline `<script>` block (fixed 2026-10-04).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
