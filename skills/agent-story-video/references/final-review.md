# Mandatory final film review

Review the actual encoded MP4s, every language and format, before calling the film finished. A successful
render, a passing `check-output.mjs`, matching transcripts or a good contact sheet do not prove a truthful,
private and watchable film — they are supporting evidence only. Use the technical checks in [qa.md](qa.md)
alongside this review.

- **Story and claims.** Watch (or step through) each film against the approved script and the facts behind it.
  The cold open must make sense on its own, the bridge must lead into the intro, and the ending's ask must be
  clear. Trace every material spoken or on-screen claim — numbers, test counts, features, limits, names — to its
  source (the project, logs, the user's notes). Keep "implemented", "tested" and "live" distinct; paraphrased
  conversations and illustrative examples carry their on-screen note. Compare languages: the same facts in each.
- **Pictures, frame by frame where it matters.** Extract frames from the final MP4s at every scene landing,
  every cue that reveals something, the cold-open seam (teaser → bridge → intro), the drop and the last second
  (`ffmpeg -ss <t> -i <file> -frames:v 1 …`); inspect them at full size. Check readable text, finished animation
  on each scene's last frame, safe zones (9:16 top/bottom), Arabic joining and right-to-left order, Latin runs
  left-to-right, captions in sync with the words and never covering the content.
- **Privacy in pixels.** On every frame that shows a screenshot — including mid-zoom and during transitions —
  each mask still covers its ID, e-mail, token, private URL or person; nothing readable through the blur;
  no browser tabs, notifications or account menus. Only the creator's approved public identity appears. A
  narrator character the user owns appears only in their own film, never in a shared template or sample.
- **The narrator.** Calm: still most of the time, rare pose changes, one jump and one wave in the ending; it
  never covers content or captions; a sprite is visible from the first frame of every scene that shows it.
- **Sound.** When the host can listen: complete narration, names and Arabic pronounced correctly, no
  hoarseness, clipping or dropped words, music under the voice, the rewind sound and the quiet beat before
  the intro. When it can't, say so plainly, measure instead (loudness per scene, silence gaps, voice-vs-music
  level, Whisper transcript of the final audio) and ask the user to listen — never claim an audible pass.
- **Files.** Every intended composition exists with the right name, dimensions, duration (= the plan),
  decodability, loudness and peaks. After any change to copy, voice, music, masks or timing, re-plan,
  re-render the affected files and repeat the affected parts of this review — a review of an earlier render
  does not cover a later one.

Fix what fails within the request (keep previous takes and renders), re-render and recheck. Keep a short
private note in the project (`out/review.md`): the file versions reviewed, which frames and checks were done,
what couldn't be checked, fixes made. Deliver only reviewed files; name anything missing or unreviewed
rather than calling the set complete. This review does not authorize posting, uploading or new paid work.
