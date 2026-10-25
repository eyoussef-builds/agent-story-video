# Scenes and their content

Each scene in `src/storyboard.json`:
```json
{ "id": "build", "type": "slides", "minSeconds": 8, "voDelay": 0.3,
  "narrator": "working", "narratorAt": { "approval": "waiting" },
  "onDrop": false, "prologue": false, "musicFrom": null, "contentFrom": null, "sfx": null,
  "content": { … } }
```
- `minSeconds` — floor; the planner rounds up to whole bars that fit the longest clip. `voDelay` — seconds
  after the landing before the voice starts (0.9 on the drop scene, so the drop hits first).
- `narrator` — the corner narrator's pose: `idle` (default), `review`, `waiting`, `working`; `"hidden"` in
  scenes that show the narrator large (intro, ending, teaser, bridge). `narratorAt` changes the pose on a cue.
  Keep changes rare — calm beats busy (`references/narrator.md`).
- `contentFrom` — use another scene's `content` (a teaser without content borrows its `musicFrom` scene's).
- Text fields: a string or `{ "en": "…", "ar": "…" }`; `[[words]]` get the yellow marker.
- Timings (`at`): a cue name from the clip (`"match"`), with an offset (`"match+10"`, `"match-6"` in
  frames), or a frame number. Missing cues fall back to a spread-out default — fix the cue instead.

## Types

### `intro`
```json
"content": { "hello": { "title": "Hi, I'm Pixel 👋", "subtitle": "…" }, "shot": "dashboard",
             "tags": [{ "text": "Telegram", "icon": "Send" }], "rewindTag": "Back to the start" }
```
Cues: `product` (the product appears), `story` (it greys out, the rewind tag shows). Defaults the greeting
to the narrator's name/subtitle.

### `dialog`
```json
"content": { "kicker": "The question that started it", "window": { "icon": "Terminal", "title": "Claude Code" },
  "messages": [
    { "who": "human", "at": "q-4", "text": "Can the bot answer in my voice?" },
    { "who": "agent", "at": "no-2", "text": "No.", "strike": { "at": "partial", "label": "Incomplete answer" } } ],
  "flow": { "at": "flow", "nodes": ["Question", "Your notes", "Draft", "You approve"], "tag": { "at": "rule-4", "text": "You stay in control" } },
  "note": { "text": "Paraphrased conversation" } }
```
The human's avatar is the brand logo; the agent's is the narrator's face.

### `questions`
```json
"content": { "kicker": "…", "chip": { "at": "skill", "icon": "Github", "text": "owner/[[planning-skill]]" },
  "questions": [{ "q": "Only for you, or for clients too?", "a": "Only for me", "at": "q1" }],
  "plan": { "at": "spec", "title": "The spec", "items": [{ "text": "A simple dashboard", "at": "panel" }] } }
```

### `slides` — the general-purpose scene
`"content": { "kicker": "…", "slides": [ { "at": "cue", "row": false, "blocks": [ … ] } ], "callout": { "at": "approval", "icon": "Hand", "text": "I need your approval" } }`

Each slide cross-fades in on its `at` (the first one is on screen from the start). Blocks stack vertically
(`"row": true` puts them side by side in 16:9). Block types:

| Block | Fields | Use for |
|---|---|---|
| `checklist` | `title`, `icon`, `iconColor`, `items: [{ text, at }]` | setup steps ticking off |
| `shot` | `shot` (id in shots.ts), `width` (0–1), `zoom: { at, to, fx, fy, len }`, `highlight: { at, box }` | real screenshots |
| `terminal` | `title`, `lines`, `at`, `step` | test runs, commands (`# pass 80` lines are styled) |
| `tags` | `items: [{ text, icon, dark, at }]` | short facts popping in on their words |
| `quote` | `text`, `icon` | the human's feedback: “It's too slow” / «بطيء شوية» |
| `grid` | `items: [{ icon, label }]`, `at`, `cols` | "what we improved" |
| `headline` | `text` (with `[[marker]]`), `at`, `size` | a punch line: "Let's see it in action 👀" |
| `code` | `file`, `code`, `at` | one real line of code |
| `phone` | `platform` (messenger/instagram/whatsapp/app), `pageName`, `items: [{ at, from: "page"/"user", text, kind: card/typing/image, card, until, badge, badgeAt, highlight }]` | the demo conversation |
| `compare` | `left`, `right` (`{ label, text }`), `bad`, `good`, `badLabel` | "what we expected vs what people wrote" |
| `note` | `text`, `icon` | "Illustrative example" |
| `stack` | `row`, `gap`, `blocks` | nested layout |

Icons are lucide names in PascalCase ("ShieldCheck", "FlaskConical"); check the name exists in lucide-react.

### `ending`
```json
"content": { "productAt": "product",
  "links": [{ "icon": "Send", "text": "Telegram · @your_bot", "at": "try" }],
  "ask": { "icon": "Github", "text": "And the code on GitHub?", "at": "github" },
  "counter": { "at": "hundred", "to": 100, "label": "shares", "sub": "… and the code goes public 💛" },
  "final": { "icon": "Share2", "text": "My part's done… the shares are yours", "at": "share" } }
```
The narrator rests, jumps once on the counter, waves twice on the final line. Without a narrator the
product icon takes its place.

### `rewind`
`"content": { "label": "Back to the start…", "labelAt": "start" }` — the cold-open bridge.

## Custom scenes
When a beat needs bespoke motion (a spelling difference highlighted letter by letter, a flow that draws
itself), write `src/scenes/custom/<Name>.tsx` and register it in `src/scenes/index.ts`. Build it from
`Paper`, `SceneKicker`, `Stage`, `Card`, `Tag`, `Pop`, `CheckRow`, `Terminal`, `Shot`, `Chat`, `Rich`,
and time everything with `useAt()` cues. Keep the safe zones of `Stage` (it leaves room for the chapter pill,
the corner narrator and the captions), and read texts through `useT()` so both languages work.
