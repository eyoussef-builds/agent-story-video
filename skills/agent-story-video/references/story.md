# The story

## The arc (what makes this format work)
A behind-the-scenes film is a small documentary narrated by the agent. People stay because it is honest and
specific — they see the real ask, the real wrong turn and the real fix. Typical beats (merge or drop freely):

| # | Beat | What it shows | Usual scene type |
|---|---|---|---|
| 0 | **Cold open** | the ending's hook (the result, the ask, the challenge) — then "let me rewind" | `ending` as `teaser` + `rewind` |
| 1 | Hello | the narrator introduces itself and the finished thing, then "let me tell you how" | `intro` |
| 2 | The ask | the human's question; the agent's first answer — often incomplete — struck through; the idea | `dialog` |
| 3 | The real problem | the non-obvious difficulty (people type it differently, the API forbids X…) | `slides` (`compare`, `code`) or custom |
| 4 | Questions first | what the agent asked before building, the human's answers, the agreed plan | `questions` |
| 5 | The build | setup steps, real screenshots of the work, "I needed your approval here" | `slides` (checklist, shot, callout) |
| 6 | Testing and fixing | real tests, real feedback ("it's too slow"), the fixes, test counts | `slides` (shot, quote, grid, terminal) |
| 7 | **The demo** (on the drop) | the thing working, step by step | `slides` (phone, shot, tags) |
| 8 | Control / extras | settings, the human in charge, other channels | `slides` |
| 9 | Try it + the ask | where to try it, the call to action or challenge (e.g. "100 shares → open source") | `ending` |

## The script
- **The user's script wins.** If they wrote one, keep their words; fix only facts, things the TTS will
  mangle, and sentences too long for a scene. Show them every change.
- **No script?** Draft one from the project — commit history, chat logs, notes, the spec, test logs — and get
  approval before any audio. Ask for what you can't know (why they wanted it, what went wrong).
- First person, the agent speaking: "Eslam asked me…", "my first answer was: no.", "so I asked him…".
- Spoken, not written: short sentences, ellipses for pauses («… »), numbers as people say them. In
  Arabic, light Egyptian (عامية مصرية خفيفة), not translated English; spell numbers the TTS mis-reads
  («تمانين» instead of «80» when «80» came out wrong).
- 120–150 spoken words per minute at speed 1.25. One clip per scene, 1–5 sentences.
- Truth: every number, feature, limit and name must be true. If a conversation is paraphrased, the
  `dialog` scene says so (`note`); an illustrative example says so too. Never invent users, quotes or results.

## Cue words
Each clip lists `cues`: name → `[englishPrefix, arabicPrefix]`. The planner finds the first word starting
with the prefix (after the previous cue) in the Whisper transcript and gives the scene that frame, so
the on-screen action happens on the word. Use `"a|b"` for alternatives (Whisper spells names in either script).
Arabic: words often carry a prefix letter — «وصور», «فعملت», «بالهاء» — use the whole spoken word.
In `storyboard.json` timings refer to cues: `"at": "match"`, `"match+10"` (frames), or a frame number.

## The cold open
Starting with the ending's hook gives people a reason to stay. The template does it without new audio:
- `teaser`: `"type": "<same as the ending>", "prologue": true, "musicFrom": "<ending id>"` and no `content`
  of its own (it borrows the ending's; `"contentFrom"` names another scene), narration
  `{ "scene": "teaser", "copyFrom": "<ending id>" }` — the same take, the same music bars as at the end.
- `bridge`: `"type": "rewind", "prologue": true, "sfx": "rewind.mp3"` with a one-line clip
  ("But the story started long before that…" / «بس الحكاية بدأت قبل كده بكتير… تعالوا نرجع للأول.»).
  Don't reuse the intro's own closing line ("let me tell you how") — say something different.
- The main track restarts when the intro lands, so the drop maths only counts the story.
The ending still plays at the end: the hook is both the promise and the payoff.

## On-screen copy
- The voice says the sentence; the screen shows the key phrase (2–6 words) with `[[marker]]` on the payoff.
- Kickers (chapter pills) are short: "The question that started it", «السؤال اللي بدأ الحكاية».
- Write `{ "en": "…", "ar": "…" }` for every visible text in a two-language film; a single string is fine
  for names, commands, URLs.
