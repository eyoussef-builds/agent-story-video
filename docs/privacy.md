# Privacy and data handling

[العربية](privacy.ar.md) · [Main explanation](../README.md)

This page explains what the skill reads, what it sends where, and what it keeps on your computer.

## What is in this repository

Instructions (`SKILL.md`, `references/`), a Remotion video template with helper scripts, and a sample story about how this skill was made (with one screenshot of a public GitHub page). No real user data, keys, private screenshots or recordings, and no one's personal character art.

## What happens when you make a film

| Step | What is read or sent | Where it goes |
| --- | --- | --- |
| Story and screenshots | Your script, notes, project files and screenshots | Your agent and its model provider, as part of the agent's normal work |
| Voice casting | 2–3 lines of your script | OpenAI (text-to-speech), then the samples' audio to OpenAI (Whisper) for the word check |
| Voice-over | The narration text you approve | OpenAI (text-to-speech) |
| Word timing and captions | The generated voice audio | OpenAI (Whisper transcription) |
| Music search | Search requests in the agent's browser | Pixabay |
| Fonts | Font download requests | Google Fonts |
| Masks, rendering, measurements and checks | Everything above | **Your computer only** (Remotion, ffmpeg, the helper scripts) |

The videos and the project folder stay on your computer. The skill **never posts, uploads, schedules or sends** them anywhere.

## Screenshots: the part to watch

Real screenshots are what make these films believable, and they're where private data leaks. The skill crops each one and blurs account/app IDs, e-mails, phone numbers, tokens, private URLs and other people's names and faces. Then it checks every mask at full size, including mid-zoom, and again on frames of the final MP4. Masks are drawn by the agent, so **watch your video before you post it** and tell the agent if anything still shows.

Prefer a test account when a screen shows other people. Your agent's model provider sees the original, unmasked screenshots you give it, so only share screenshots you're comfortable sending to it.

## Your API key

The skill asks before using your OpenAI API key. It reads it from the `OPENAI_API_KEY` environment variable or from where you keep it (for example a macOS Keychain item, which asks you to Allow), passes it only to the voice commands, and never prints, logs or saves it. OpenAI charges your account at its normal API prices.

## Your narrator character

If you use your own animated character, its sprite sheet stays in that video project (`public/narrator/`). The skill never copies it into its template, a sample or anyone else's video. If you share a project folder, check for it first.

## Things to keep private

- `references/local-profile.md` is for your own settings (where your key lives, your workspace, your character). Keep it out of any public repository.
- `casting/` holds your voice samples and `public/shots/` your screenshots. Keep them out of public repositories too (the template's `.gitignore` already skips `casting/`).

## AI disclosure

The voice-over is AI-generated. OpenAI's policies require telling listeners that. Add "AI voice-over" (or similar) when you post. Label paraphrased conversations and illustrative examples on screen; the skill does this with small note tags.
