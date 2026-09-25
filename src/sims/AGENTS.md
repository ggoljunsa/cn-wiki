<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-25 | Updated: 2026-09-25 -->

# sims

## Purpose
Step-through simulators — "a C debugger for the slide's code": code panels with a current-line marker, a variable table that highlights diffs, a description per step, optional SVG per step. 16 sims; the catalogue with their target articles is in `CONTRACT.md` §6.

## Key Files
| File | Description |
|------|-------------|
| `_engine.js` | SimEngine: options → `build(opts)` → steps; controls (⏮ ◀ ▶ ⏭, autoplay, slider, ← → keys); mounts on `.sim[data-sim]`. |
| `nyquist_shannon.js`, `db_calc.js`, `bdp_pipe.js`, `pcm_encoder.js`, `encapsulation.js`, `block_4b5b.js`, `fsk_bandwidth.js`, `delta_modulation.js` | CH01–CH02: worked Examples 2.5/2.6/2.8/2.9/2.13, Ex 5 (FSK), PCM p.55 table, 4B/5B, BDP, encapsulation. |
| `byte_stuffing.js`, `bit_stuffing.js`, `hamming_distance.js`, `parity_check.js`, `crc_division.js`, `aloha_backoff.js`, `aloha_throughput.js`, `csma_cd_minframe.js` | CH03: framing, Ex 3.2/3.3/3.7, CRC p.46–47 division, Ex 3.8/3.11/3.12. Expected final values are listed in `../CONTRACT.md` §6. |
| `_reference_ticket_lock.js.txt` | Reference implementation copied from 운체위키 (not built). |
| `syscall_trap.js`, `context_switch.js`, `proc_states.js`, `fork_exec.js`, `thread_stack.js` | 3–4강 and 8강 mechanisms. |
| `sched_gantt.js`, `mlfq.js`, `stride_lottery.js`, `cfs_eevdf.js` | 5–6강 scheduling policies with editable inputs. |

## For AI Agents

### Working In This Directory
- A sim is `SIMS["name"] = { title, desc, options, build(opts) }` returning `{ panels, vars, steps }`; every step carries a full `vars` snapshot (the engine diffs consecutive steps).
- No DOM access inside a sim file — `test_sims.js` runs them without `document`.
- `pc` values are 1-based line numbers into the panel's `lines`; `null` means idle.

### Testing Requirements
`node src/test_sims.js` (all option combinations must build, `steps.length > 0`, `pc` in range).

### Common Patterns
- Use `status: { T1: "running", T2: "spinning" }` for badges; known badge classes: running, ready, spinning, blocked/parked/sleeping, done/finished.
- `note:` for the red warning box at the step where the bug/race manifests.

## Dependencies

### Internal
- `renderer.js` `inlineFormat` for `[[링크]]` inside step descriptions.

<!-- MANUAL: -->
