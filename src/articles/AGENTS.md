<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-25 | Updated: 2026-09-25 -->

# articles

## Purpose
The 205 wiki articles, one per file. File name = `{정렬번호}_{key}.wiki`; the sort prefix groups them into nav sections (00 안내, 10 CH01, 20 CH02 Signals, 30 CH02 Transmission, 40 CH02 Digital Transmission, 50 CH02 Analog Transmission·Multiplexing, 60 CH03 DLC, 70 CH03 MAC, 80 CH03 Addressing, Z0 용어).

## Key Files
| File | Description |
|------|-------------|
| `00_main.wiki` | Front page: scope, how to read, links into every section. |
| `01_읽는 순서.wiki` | Recommended reading order. |
| `02_시험 정보.wiki` | Exam/quiz dates and scope (mirrors `../../../../_시험정보.md`). |
| `10_CH01 Introduction`, `20_CH02 Signals`, `30_CH02 Transmission`, `40_CH02 Digital Transmission`, `50_CH02 Analog Transmission`, `51_CH02 Multiplexing`, `60_CH03 Data-Link Control`, `70_CH03 Media Access Control`, `80_CH03 Link-Layer Addressing` | The lecture main articles: slide-order body, most captures, sims and anims, `== 시험 대비 핵심 요약 ==`. |
| `00_main` … `06_공식 모음` | Guide articles: 대문, 읽는 순서, 시험 정보, 자주 틀리는 함정 모음, 0920 오답 복기, 계산 문제 모음, 공식 모음. |
| `E1_퀴즈1 복기.wiki` | Quiz 1 (2026-09-23) replay with the professor's exact questions. |
| `E2_2025F 중간고사 족보.wiki` | Past midterm walkthrough, source of `{exam}` boxes elsewhere. |
| `E3_자주 틀리는 함정 모음.wiki` | Cross-cutting trap list. |
| `Z0_*.wiki` | Short glossary entries (Forouzan, 교수 소개, bps와 Hz, log₂ 계산법, XOR, modular arithmetic). |

## For AI Agents

### Working In This Directory
- Header block is `key:` / `title:` / `category:` then a `---` line; `build.py` exits 1 if it is malformed.
- Link only to keys in `CONTRACT.md` §5. A link to a non-existent key renders as a grey stub and shows up in `build.py`'s BROKEN LINKS report.
- Every article needs ≥1 `{analogy}` and ≥1 visual (`[[img:]]`, `[[sim:]]`, `[[anim:]]` or an `ascii` pre block). Hub articles: ≥3 real slide captures + an anim.
- Order inside an article: overview → `{def}` → `{analogy}` → `[[anim:]]` → `[[sim:]]` → slide-order body → `== 시험 대비 핵심 요약 ==` → `== 관련 문서 ==`.
- Do not paraphrase the professor's English terms into Korean.

### Testing Requirements
`python3 build.py` (broken links 0, missing images 0) and `node src/test_render.js index.html`.

### Common Patterns
- Captions: `p.31 무엇 — 한 줄 설명`. Size `large` for full diagrams, `small` for little tables.
- `{exam}` boxes carry things that actually appeared on Quiz 1 or the 2025F midterm; `{warn}` for known traps.

## Dependencies

### Internal
- `../sims/`, `../anims/` by name; `../../_slides/` by file name.
- Facts come from `../../../강의자료/`, `../../../정리본/`, `../../../문제풀이/`, `../../../족보/`.

<!-- MANUAL: -->
