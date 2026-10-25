# Casting the narrator's voice

The voice is the character. Choosing it is a short, measured back-and-forth with the user — you usually
can't listen, so you combine their ears with numbers. Budget 1–4 rounds; each costs a few cents.

## 1. The brief
From the intake answer, write one line: who speaks, how old they sound, the mood, the language/accent, and
what to avoid. Examples:
- "A warm, friendly adult agent; clear and bright; proud but humble; natural pace."
- "A cute, cheerful kid-like voice for a small cartoon fox — sweet and full of wonder, not robotic, no hoarseness."

## 2. Round 1 — 3 or 4 different base voices
`casting.json` (project root):
```json
{ "line": { "ar": "2–3 sentences from the real script, with a name and a pause…" },
  "langs": ["ar"],
  "candidates": [
    { "id": "A", "voice": "marin" },
    { "id": "B", "voice": "coral" },
    { "id": "C", "voice": "sage", "pitch": 4, "style": "a cute, cheerful kid" } ] }
```
Pick candidates that fit the brief from OpenAI's voices (`alloy, ash, ballad, coral, echo, fable, nova,
onyx, sage, shimmer, verse, marin, cedar`). Starting points:

| Brief | Try first |
|---|---|
| warm adult, clear | `marin`, `coral`, `cedar` |
| calm, low | `cedar`, `onyx`, `ash` |
| bright, energetic | `nova`, `shimmer`, `coral` |
| child-like / cartoon character | `marin` or `nova` with `"pitch": 4…6` + kid direction |

The base direction comes from `narration.json` `style`; a candidate's `style` adds to it
(`replaceStyle` replaces it). `pitch` lifts pitch *and* formants in semitones (that's what makes an adult
voice sound young); `speed` is the tempo (default 1.25); `clean` is an ffmpeg chain applied after.

Run `OPENAI_API_KEY=… node scripts/voice-casting.mjs`. Send every MP3 in `casting/` to the user
(SendUserFile) together with the table from `casting/report.md`, and ask: *which one is closest, and what's
off?* Offer the samples as choices in the host's question tool when there is one.

## 3. Read the numbers
| Measure | Meaning | Guide |
|---|---|---|
| Pitch (Hz) | median voice pitch | ~100–150 deep adult · ~170–230 light adult · ~250–350 child-like |
| Range (st) | how much the pitch moves (10–90th pct) | < 6 flat/monotone · 8–11 lively |
| Clarity (dB) | median harmonics-to-noise ratio | higher = cleaner; compare within a round |
| Rough % | voiced frames under 9 dB | lower = less hoarse/breathy/raspy |
| Chars/s | speaking rate | Arabic ≈ 11–13 at ×1.25; English ≈ 15–17 |
| Words heard | Whisper's match with the script | < 85 % → mumbled or skipped words |

Calibration from a real casting (a kid-like character): the voice the creator accepted measured
284 Hz, clarity 12.2 dB, rough 30 %; the ones they called "hoarse" measured 9.7–10.1 dB and 43–45 %
rough; rejected adult voices 6.8–7.2 dB and ~65 % rough. Clarity and rough % track what people call
hoarseness — use them to pre-screen, never to overrule the user's ears.

## 4. Turn feedback into knobs
| The user says | Change |
|---|---|
| "weird", "unnatural", "chipmunk" | smaller pitch lift (−1 or −2 st) — or a base voice that is already higher |
| "hoarse", "breathy", "raspy" (بحّة) | a different base voice (compare clarity/rough %), add "clear, clean, smooth — absolutely no breathiness, no rasp, no hoarseness, no whisper, no vocal fry" to the style, add `"clean": "afftdn=nf=-32,deesser=i=0.3,lowpass=f=9000"` |
| "robotic", "flat" | more acting direction (smiling, wonder, pauses at ellipses), a livelier voice (higher range) |
| "too old" / "too young" | pitch ±2 st, or kid/adult direction |
| "too fast" / "too slow" | speed ∓0.1 (stay 1.1–1.4) |
| "wrong accent" | stronger language direction ("Egyptian Arabic, Cairo accent, not Modern Standard Arabic") |
| "this one is good, but…" | keep the base and change one knob at a time |

Round 2+ adds candidates with new ids (`A2`, `D`…) and runs `--only A2,D`; unchanged raw takes are cached,
so pitch/speed/clean variants cost nothing. Keep the rejected ones in the report — the user may compare.

## 5. Lock it in
Copy the accepted candidate into `src/narration.json`: `voice`, `speed`, `pitch`, `clean`, and its style
added to `style`. Generate the voice-over with `make-voiceover.mjs` (same chain). Mention the voice in the
delivery message ("marin, +6 semitones, ×1.25, breath clean-up").
