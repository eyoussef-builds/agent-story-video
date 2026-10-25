# The narrator

The film is told by the agent. Whether it also *appears* is the user's choice — ask; never assume.
Many creators have no character, and one that a creator owns is theirs only.

## The four kinds (`src/narrator.json` → `"kind"`)

| Kind | What the viewer sees | Needs |
|---|---|---|
| `"none"` | no on-screen narrator; the voice and captions tell the story; scenes use the full width | nothing |
| `"badge"` (template default) | a neutral circle with an icon (`"badge": { "icon": "Bot", "color": "#FFE04A" }`) whose ring lights up with the voice | nothing |
| `"image"` | the creator's avatar, the agent's logo or the product icon in a circle (`"image": "narrator/avatar.png"`) | one square PNG |
| `"sprite"` | the creator's own animated character from a sprite sheet | a sprite sheet (below) |

`name` and `subtitle` feed the intro greeting ("Hi, I'm Pixel 👋 — the agent behind the build"); in chat
scenes the agent's avatar is `NarratorFace` (a crop of the sprite, the image, the badge or initials).
The human's avatar is the brand logo.

## Sprite sheets
```json
"sprite": { "file": "narrator/sprites.png", "cell": [192, 208], "columns": 8, "rows": 9, "fps": 6,
  "states": { "idle": [0, 6], "waving": [3, 4], "jumping": [4, 5], "waiting": [6, 6], "working": [7, 6], "review": [8, 6] },
  "face": { "row": 0, "col": 0, "x": 40, "y": 8, "size": 110 } }
```
- One row per state, frames left to right, all cells the same size, transparent background (PNG).
- `states`: `[row, frameCount]`. The engine uses `idle` (rest), `review` (reading/thinking), `waiting`
  (asking the human), `working` (building), `jumping` and `waving` (one-off gestures). Missing states fall
  back to `idle`.
- `face`: the square (`x`, `y`, `size`, in cell pixels) to crop from one frame for chat avatars.
- Frame 0 of each row must be a good still pose: it is what the viewer sees most of the time.
- Check the sheet once by rendering a still of a scene with the corner narrator; a wrong `cell` or
  `columns` shows a sliced character.

## Calm motion (a firm rule)
Viewers watch the screenshots and read the captions — a busy character steals the eye. The engine:
- holds the still frame (frame 0) and plays **one slow cycle** when the pose changes, then one every
  5 seconds (`every`, a blink/small gesture) — never a continuous loop;
- lifts a sprite by 1–2 px with the voice (`talk`) and only lights the ring of an image/badge;
- plays the jump once (on the challenge counter) and the wave twice (on the closing line) in the ending,
  and a double wave in the intro greeting.
In the storyboard, change `narratorAt` poses rarely (a few per film): `idle` most of the time, `review` for
reading/explaining, `working` during the build, `waiting` when the agent needs the human. If the user
still finds the narrator distracting, use fewer pose changes, a smaller `size`, or `"kind": "image"`/`"badge"`.

## Privacy and ownership
- A creator's character is their own work: keep it in their workspace (`public/narrator/`), never in a
  shared/public template, sample or repo, and never use it for someone else's video.
- Don't invent a character "inspired by" a famous mascot, and don't use an avatar made from a real person
  other than the user (with their consent).
- The user's photo is personal data: only use it if they offer it for this video.
