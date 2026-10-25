---
name: agent-story-video
description: Turn the behind-the-scenes story of how an AI agent built something — the human's ask, the agent's first (wrong) answer, the questions, the build, the tests, the demo — into a narrated motion-graphics video told by the agent itself, in English and/or Egyptian Arabic, 16:9 and 9:16. Uses the user's script (or drafts one from the project), real screenshots with private details blurred, an optional narrator (the creator's own animated character, a photo/logo, a neutral badge, or none), a voice chosen in a measured casting round, word-timed burned-in captions, a cold open that starts with the ending, and royalty-free music cut on the beat. Use when the user wants a "behind the scenes", "how my agent built it", "making-of", build-story or dev-diary video, or says «فيديو من ورا الكواليس» / «الوكيل يحكي إزاي عمل المشروع» — even with only a script and some screenshots. Not for product launch/showcase promos from a repo (use a showcase skill), screen-recording edits or talking-head videos.
---

# Agent story videos — "how my agent built it", told by the agent

The film is a short documentary in the agent's voice: *the human asked → I answered (and got it partly
wrong) → I asked questions → I built → we tested and fixed → here it is working → try it*. It is honest,
specific and warm: real screenshots, real numbers, real mistakes, and the people's private details hidden.

Ask before you build — this format depends on choices only the user can make (see step 2). Keep the user
posted with one short line per step; a 2–4 minute film takes a few hours of agent work.
If `references/local-profile.md` exists, read it first: it holds this user's private defaults (where their
API key is stored, their public identity, workspace folder, their own narrator character) and overrides the
defaults below.

| Setting | Default (offer it; the user decides) |
|---|---|
| Languages / formats | the user's language(s); 1920×1080 and 1080×1920, 30 fps, both formats share one timeline |
| Length | whatever the story needs — typically 1.5–4 min (`storyboard.targetSeconds`) |
| Footage | real screenshots of the project + motion graphics drawn in code (chats, checklists, terminals) |
| Narrator | none / a neutral badge unless the user has their own character or avatar (`src/narrator.json`) |
| Voice | chosen in a casting round (step 4) — OpenAI `gpt-4o-mini-tts`, speed ≈ 1.25× |
| Captions | burned in, timed to each spoken word, the brand yellow pill |
| Opening | a cold open: the ending's hook first, a "rewind" bridge, then the story from the start |
| Music | Pixabay, **not Content-ID registered**, calm-to-uplifting, analysed for tempo and drop |
| Brand | `template/src/brand.json` (ships with the eyoussef.me look: paper, ink, yellow) |

**Requirements:** Node 18+, ffmpeg + ffprobe, an OpenAI API key (voice + transcription, cents per round),
internet (fonts, music). Best with a browser tool (music search) and permission to run commands outside
a sandbox. Tested end-to-end in Claude Code (desktop app) on macOS.

Everything reusable is in `template/` (a Remotion project) — copy it, never rebuild the engine. Read each
reference when you reach its step:

- `references/story.md` — the story arc, writing/editing the script, honesty rules, cue words, the cold open
- `references/scenes.md` — scene types and their `content` (dialog, questions, slides blocks, ending…), custom scenes
- `references/screenshots.md` — collecting, cropping and **masking** real screenshots; what must never show
- `references/narrator.md` — the four narrator kinds, the sprite-sheet format, calm-motion rules, character privacy
- `references/voice-casting.md` — choosing the voice with the user: brief → samples → numbers → feedback → adjust
- `references/audio.md` — music search/choice/extension, the voice-over, captions, the mix
- `references/qa.md` — Arabic/RTL, rendering pitfalls and the QA checklist
- `references/final-review.md` — the mandatory final review of the actual MP4s (step 8)

## Workflow

### 1. Set up the workspace
W = `$HOME/Movies/Agent Story Videos/<project-name>` unless the local profile names another folder;
SKILL_DIR = the folder this SKILL.md is in. Run as separate commands:

```bash
mkdir -p "$W"
cp -R "$SKILL_DIR/template" "$W/video"
cd "$W/video" && npm install
node scripts/plan-timeline.mjs --preview
```
The template contains a complete sample story (how this skill was made) — it renders as-is, so you can
preview it to see every scene type; you replace its story, screenshots and narration. **Run Remotion
(stills, renders) with the shell sandbox disabled** — its headless Chrome aborts inside the sandbox.

### 2. Intake — ask once, in one batch
Read what the user gave you (script, notes, screenshots folder, project repo/folder, chat logs) first, then
ask only what's still open, with a recommended option first (use the host's question tool if it has one):

1. **The story** — use their script as written (fix only facts and timing), or draft one from the project
   for their approval (`references/story.md`).
2. **Footage** — real screenshots + motion (recommended), or motion only (everything redrawn in code).
3. **Narrator** — their own animated character (they supply the sprite sheet), a photo/logo, a neutral badge,
   or no on-screen narrator. Never assume one: many creators have no avatar, and a character the user owns
   is theirs alone — never reuse it for anyone else or in public samples (`references/narrator.md`).
4. **Voice** — what character the voice should have (a warm adult, a cute kid-like voice, calm, energetic…);
   it will be picked from samples in step 4.
5. **Languages and formats** — e.g. Egyptian Arabic 16:9 + 9:16.

Then ask once for permission to use their OpenAI key (the casting round and the voice cost a few cents).

### 3. Story, screenshots and storyboard
Follow `references/story.md` and `references/scenes.md`:
- Split the script into 7–12 scenes (one beat each) in `src/narration.json` (`ar`/`en` text + cue words),
  and the matching scenes in `src/storyboard.json` (type, `content`, narrator pose). Add the cold open: a
  `teaser` scene (same type as the ending, `"prologue": true, "musicFrom": "<ending id>"`, narration
  `"copyFrom": "<ending id>"`) and a `bridge` scene (type `rewind`, `"prologue": true, "sfx": "rewind.mp3"`).
- Mark the scene where the result first appears (usually the first demo beat) `"onDrop": true, "drop": true`.
- Put screenshots in `public/shots/`, register crops **and masks** in `src/story/shots.ts`
  (`references/screenshots.md`). Every account ID, e-mail, phone number, token, private URL, and every other
  person's name/face gets a mask. Check each at full size.
- Set the narrator in `src/narrator.json`, `product` (name, icon, accent, outputName), `langs`, `targetSeconds`.

Preview silently before spending anything:
```bash
node scripts/plan-timeline.mjs --preview && npx tsc -p .
node scripts/stills.mjs ar-landscape --scenes && node scripts/stills.mjs ar-vertical --scenes
```
Look at the contact sheets (`out/stills/*-sheet.png`) and fix overflow, overlaps, RTL problems, empty areas,
unmasked private data. Add `--full` to inspect small text or a mask at full size.

### 4. Cast the voice (with the user)
Follow `references/voice-casting.md`: write `casting.json` (3–4 candidates that fit the brief), run
```bash
OPENAI_API_KEY="…from where the local profile says…" node scripts/voice-casting.mjs
```
send the MP3s from `casting/` to the user with the table from `casting/report.md`, and ask which one —
or what's wrong. Turn their words into knob changes ("weird" → smaller pitch lift; "hoarse/breathy" →
another base voice + "no breathiness" direction + clean-up chain; "too fast" → −0.1 speed) and run another
round with `--only`. Stop when the user accepts a sample; copy its voice/pitch/speed/clean/style into
`src/narration.json`. Never print, log or save the key — pass it only into the one command.

### 5. Music
Follow `references/audio.md`: search Pixabay from the browser with `scripts/pixabay-search.js`, skip
Content-ID-registered tracks, download 2–4 candidates to `music/candidates/`, analyse each, and pick by fit
(`node scripts/plan-timeline.mjs --music music/candidates/<f>.json` after the voice exists). A track that's
a few bars short is lengthened with `scripts/extend-music.mjs`. Tell the user the title, artist and link.

### 6. Voice-over, captions, plan
```bash
OPENAI_API_KEY="…" node scripts/make-voiceover.mjs     # one clip per scene, Whisper word timings
node scripts/make-captions.mjs                         # script-aligned captions + talk envelope
node scripts/plan-timeline.mjs                         # bars, cues, drop, cold open — fix every warning
node scripts/make-rewind.mjs                           # the bridge's tape-rewind sound
```
Read every transcript and "⚠ possibly not spoken" line: regenerate a clip once with `--only <scene>`; if
words are still dropped, rephrase (a clip that *starts* with an English name is the usual culprit in Arabic —
put an Arabic word before it). A Whisper misspelling of a name is not a mispronunciation — fix the cue prefix.

### 7. Render and check
```bash
node scripts/stills.mjs ar-landscape --scenes && node scripts/stills.mjs ar-vertical --scenes
node scripts/render-all.mjs            # every composition in storyboard.langs × 16:9 / 9:16
node scripts/check-output.mjs          # size, length, loudness −19…−12 LUFS, peaks < −1 dB, drop
```

### 8. Mandatory final review
Read and perform [the final film review](references/final-review.md) on every final encoded MP4, alongside the
technical QA. Compare the story, every claim, the masks on every screenshot frame, captions, the narrator, the
cold-open seam, the drop, the end card, Arabic/RTL and the sound with the approved script and the facts. Fix
findings, re-render and recheck the affected files, and keep a short private note of what was reviewed. A
passing checker, transcript or contact sheet alone does not establish a finished film; state plainly what you
could not check (you usually cannot listen — invite the user to check the voice and the rewind by ear).

### 9. Deliver
Send the MP4s (SendUserFile if available, otherwise full paths) with a short scene-by-scene summary, the
voice that was chosen, the track (title · artist · Pixabay link · no Content ID), what was verified and
what wasn't, and where the project lives for edits. Remind them: OpenAI requires disclosing the AI voice
("AI voice-over" in the caption) and crediting the track is good practice. Then take feedback — a typical
round is "the narrator moves too much", "start with the ending", "make the captions yellow" — change the
inputs, re-plan, re-render, re-check.

## Quality bar
- True and specific: real asks, real numbers ("80 tests passed"), real fixes. A paraphrased conversation or
  an illustrative example is labelled on screen (`note` tags). Nothing private is visible — ever.
- Calm narrator: it holds still, gestures rarely (one jump, one wave per film), never competes with the content.
- Every scene lands on a downbeat; the demo lands on the drop; on-screen actions happen on the words that
  describe them (cue words). Change inputs and re-plan — never hand-edit `plan.json` frame numbers.
- One idea per scene, few words on screen: the voice tells, the screen shows the key phrase with the yellow marker.
- Arabic reads naturally (Egyptian, not translated English) and right-to-left; Latin names/URLs stay LTR.
