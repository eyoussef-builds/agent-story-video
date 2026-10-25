# Brand, Arabic/RTL, rendering pitfalls, QA and the final review

## Brand (`src/brand.json`)
Ships with Eslam Youssef's eyoussef.me look: paper `#FAF8F2`, ink `#15130F`, yellow `#FFE04A`, the "sun"
logo, Schibsted Grotesk + IBM Plex Sans Arabic. Another creator edits `name`, `site`, `logo` and the
colour tokens. The creator's site tag shows between the intro and the end card; the end card shows
"name · site". The product's own colours appear only inside its screenshots and UI.

## Arabic and right-to-left
- The Arabic composition is `dir="rtl"`: rows, chats and slides mirror. Screenshots, terminals, code and
  URLs stay LTR. Latin runs inside Arabic text (names, @handles, URLs, "Claude Code") are isolated LTR in
  the Latin font automatically by `Rich`; in custom code use `<span dir="ltr">` or U+2066…U+2069.
- Never letter-space Arabic. Use Western digits (80, 100). Egyptian, not Modern Standard Arabic.
- Check each Arabic still: joined letters, mixed-run order, the marker sweeping right-to-left, nothing
  clipped at the right edge.

## Rendering pitfalls
- Run `stills.mjs` / `render-all.mjs` with the shell sandbox disabled (headless Chrome: "ICU data",
  "GPU process isn't usable", "Target closed").
- `src/plan.json`, `src/captions.json`, `src/vo-env.json` must exist before bundling — run
  `plan-timeline.mjs --preview` after copying the template.
- Never hand-edit `plan.json`; change inputs and re-plan. After any copy/voice/music change: re-run
  captions → plan → stills → render → check.
- A 4-minute film renders in ~2–3 minutes per format.

## QA checklist
- [ ] Contact sheets of every composition after the final plan (each scene: settled, last cue, last frame):
      no overflow/overlap, safe zones kept, Arabic correct, every last frame finished.
- [ ] `plan-timeline.mjs` prints no warnings; transcripts match the script.
- [ ] Every screenshot frame checked at full size: masks cover every private detail, also mid-zoom.
- [ ] `check-output.mjs` passes: all files, sizes, lengths = plan, loudness, peaks, drop arithmetic.
- [ ] Claims true, labelled where paraphrased/illustrative; only the creator's approved public identity.
- [ ] Narrator calm (rare pose changes; one jump, one wave); captions yellow, readable, in sync.
- [ ] Music credited (title · artist · Pixabay link · not Content ID registered).

## Mandatory final review (on the encoded MP4s)
A render, a passing checker or a contact sheet is not a finished film. On the actual MP4s:
- Story: compare each scene's words and visuals with the approved script and the facts; the cold open
  makes sense on its own and the bridge leads into the intro; the ending's ask is clear.
- Pictures: extract frames at every scene landing, every cue that reveals something, the cold-open seam
  (teaser → bridge → intro), the drop and the last second; inspect at full size; masks hold on every frame.
- Sound (when the host can listen): complete narration, names pronounced, no hoarseness/clipping, music
  under the voice, the rewind sound, the quiet beat before the intro. When it can't, say so and measure:
  loudness per scene, silence gaps, voice-vs-music level; invite the user to listen.
- Files: names, dimensions, durations, decodability, loudness and peaks for every format.
Fix what fails, re-render the affected files, re-check them, and keep a short private note of what was
reviewed and what couldn't be. Deliver only reviewed files, and name anything missing.
