# Real screenshots — collected, cropped, masked

Real screens make the story believable. They are also where private data leaks. Treat every screenshot
as private until each sensitive region has a mask you've checked at full size.

## Collecting
- Use the user's own screenshots of the project (dashboards, settings, test results, the live result).
  Ask for missing ones by name ("the screen where you approved the permissions").
- A public web page can be captured headlessly, e.g.
  `"<Chrome>" --headless=new --hide-scrollbars --force-device-scale-factor=1 --blink-settings=preferredColorScheme=1 --window-size=1512,900 --screenshot=out.png <url>`
  (`preferredColorScheme=1` = light theme, which matches the paper look).
- Copy what you use into `public/shots/` (keep originals elsewhere). PNG, at the size it was captured.

## Registering (`src/story/shots.ts`)
```ts
dashboard: { src: "dashboard.png", size: [1600, 900], crop: [0, 0, 1512, 900], title: "My app · Overview",
             masks: [[1180, 24, 260, 36], [96, 410, 520, 40]] },
```
- `size` = the image's real pixel size (`ffprobe` or `sips -g pixelWidth -g pixelHeight`).
- `crop` = `[x, y, w, h]` of the part to show — cut browser chrome, extension icons, bookmarks bars, other tabs.
- `masks` = `[x, y, w, h]` boxes blurred over private details (in image pixels, before cropping).
- `title` = the window title drawn above it ("Facebook", "github.com/…"). Never the real private URL.
- In scenes: `zoom: { at, to, fx, fy }` slowly pushes in on a point; `highlight: { at, box }` draws the
  yellow focus box (image pixels).

## What must be masked (or cropped out)
- account / app / page / project IDs, API keys, tokens, webhooks, secrets, verification codes
- e-mail addresses and phone numbers (also the user's own unless they approved showing them)
- other people: names, profile pictures, usernames, comments — use a test account or mask it
- private URLs (admin consoles, project URLs, storage buckets), file paths with a username, machine names
- billing, money amounts, addresses, anything from a customer
- notifications, chat previews, bookmarks and tabs that sneak into the frame
Where a scene needs to *show* that a person commented, draw it in code with a blurred avatar and a grey
name bar plus a tag like "Test account" — don't use a real stranger's comment.

## Checking
1. Render a still of every scene with a shot at full size (`node scripts/stills.mjs ar-landscape <frame> --full`).
2. Zoom into each mask: nothing readable through the blur, no edge of the text peeking out.
3. Remember zooms: a mask that covers the field at 1× must still cover it at the zoomed frame.
4. Do it again on the final MP4 frames (`references/qa.md`).
