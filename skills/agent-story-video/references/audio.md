# Music, voice-over, captions, mix

## Music
### What fits
A behind-the-scenes story is longer and more personal than a launch promo: a warm, steady track that
grows — calm-uplifting corporate, light electronic, inspiring background — with a clear lift (the "drop")
where the result first appears. Avoid aggressive trailers and sleepy lo-fi. 100–130 BPM keeps bar-length
cuts natural. Length ≥ the story part of the film (the cold open re-uses bars from the end).

### Licensing (non-negotiable)
Pixabay tracks under the Pixabay Content License that are **not "Content ID registered"** (a registered
track gets the user's YouTube/Facebook upload claimed). Note title, artist and page URL. Never rip music
from videos or streaming services; never put the raw MP3 in a public repository (using it inside the
rendered video is fine).

### Finding candidates (browser)
Pixabay blocks scripted requests. In the built-in browser: open `https://pixabay.com/music/`, paste
`scripts/pixabay-search.js` into the page once (edit `__pxQueries` for the mood: "inspiring corporate",
"technology background", "uplifting"), then call `await __pxRun()` until it returns `status: "done"` — it
resumes across calls and page reloads (localStorage) and throttles itself; `__pxReset()` starts over.
Download 2–4 candidates with curl into `music/candidates/`. **No browser?** Ask the user to save 2–4 MP3s
there (skipping tracks marked "Content ID registered"). On a track's page, the license line reads "Free for
use under the Pixabay Content License"; a registered track shows a Content ID badge.

### Choosing by fit (you can't listen — measure)
`node scripts/analyze-music.mjs music/candidates/<f>.mp3 --json music/candidates/<f>.json` prints the
tempo, bar length and per-bar energy/punch sparklines (quiet intro ▁, build ▂→▆, break, DROP ▇█, wind-down).
After the voice-over exists, compare candidates instantly with
`node scripts/plan-timeline.mjs --music music/candidates/<f>.json`: the planner starts the track on a
4-bar phrase (skipping up to ~27 bars) and pads up to 3 bars so the `onDrop` scene lands on the drop.
Pick the one with no warnings (drop aligned, track long enough); tie-break on tempo 100–130 and downloads.
Then `cp <f>.mp3 public/music.mp3 && cp <f>.json music/analysis.json`.

### A track a few bars too short
`node scripts/extend-music.mjs --repeat A-B` plays bars A…B−1 twice (after bar B it jumps back to bar A,
with an 80 ms crossfade). Choose A and B at matching phrase starts **after the drop** (8 or 16 bars apart)
so the drop stays where it was; repeating bars before the drop moves it later. Re-run `analyze-music.mjs`
and the planner afterwards. The original stays in `music/original.mp3`.

## Voice-over (`scripts/make-voiceover.mjs`)
- One clip per scene from `narration.json` (`voice`, `speed`, `pitch`, `clean`, `style`, `pronounce`) →
  OpenAI `gpt-4o-mini-tts` → pitch/speed chain → clean-up → trimmed → −16 LUFS → Whisper word timings.
  The language direction is added per language (Egyptian Arabic, Cairo accent; natural American English).
- The key: ask the user first; use `OPENAI_API_KEY` from the environment or from where the local profile
  says (e.g. a macOS Keychain item: `security find-generic-password -s <service> -a <account> -w`, which
  makes macOS ask the user). Put it only in that one command's environment; never echo, log or save it.
- Read every transcript. "⚠ possibly not spoken" → regenerate once with `--only <scene>` (the previous take is
  kept in `out/.vo-prev/`). Still missing → rephrase: TTS tends to drop a short closing sentence and the
  start of an Arabic clip that begins with an English name.
- Whisper's spelling isn't the voice's pronunciation ("Eslan" for "Eslam"); judge by what's missing,
  then fix cue prefixes. Numbers the TTS misreads: spell them out in the script.
- The teaser clip uses `"copyFrom"` — no second take, identical audio.
- OpenAI requires telling listeners the voice is AI-generated — remind the user when they post.

## Captions (`scripts/make-captions.mjs`)
Aligns the *script* (not Whisper's spelling) to the spoken words and writes `src/captions.json` (phrases of
≤ 6 words, never mixing an Arabic phrase with a Latin one) and `src/vo-env.json` (voice loudness per frame,
for the narrator's talk ring/lift). `CAPTION_WORDS=8` for longer phrases. Captions are a yellow pill with
ink text and a thin ink outline (readable on the yellow end card too); they sit beside the corner narrator.

## Mix and sync (handled by the template)
- Scenes are whole bars long, each landing on a downbeat; the drop scene lands on the drop; the end card
  rides the wind-down when that adds ≤ 2 bars, otherwise the music fades out over 1.5 s.
- Cold open: the teaser plays over the same track bars as the ending (`musicFrom`), fades over 14 frames
  into the bridge; the bridge has no music, only the tape-rewind sound (`make-rewind.mjs`: the teaser's
  last 4 s reversed and sped up); the track restarts on the intro's downbeat — a half-second of quiet
  before it is intentional.
- Music 0.5 (≈ −16 LUFS alone), ducked to 42 % under the voice; voice ≈ 7 dB above the ducked music.
- Master target −19…−12 LUFS (≈ −16), true peak < −1 dBFS — `check-output.mjs` verifies this and the drop.
