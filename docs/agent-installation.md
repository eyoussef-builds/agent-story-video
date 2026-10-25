# Step-by-step installation for 15 agents

[العربية](agent-installation.ar.md) · [Main explanation](../README.md)

Think of the skill as a small instruction book. We download it, put it on the shelf your assistant knows about, then ask the assistant to read it. You do not need to edit code.

## 1. Download the folder once

1. Open [this repository](https://github.com/eyoussef-builds/agent-story-video).
2. Click the green **Code** button, then **Download ZIP**.
3. Extract the ZIP. Open the extracted folder containing `README.md` and `skills`.
4. Check that `skills/agent-story-video/SKILL.md` exists. Install the complete `agent-story-video` folder with its `template/`, `references/`, `evals/` and scripts, not just `SKILL.md`.
5. Choose your agent below. Install one copy in one location; you do not need every directory.

Or, if Git is installed, open Terminal or PowerShell in a suitable download folder and run:

```sh
git clone https://github.com/eyoussef-builds/agent-story-video.git
cd agent-story-video
```

This is a local skill-folder package, not a registered marketplace plugin. You need one installed, signed-in agent, not all 15.

## 2. How to copy it

**Without commands:** each agent's destination is below. `~` means your own home folder, not a particular person's username. On macOS, use Finder → **Go → Go to Folder**. On Linux, use your file manager and reveal hidden folders if needed. On Windows, open your user folder and create the directories shown by the PowerShell path. If the destination does not exist, create its parent directories inside your own home folder first. Copy the complete skill folder there. If a copy exists, compare it before replacing it.

**With commands:** open a terminal in the extracted repository folder. In your agent's section, choose the macOS/Linux or PowerShell destination line. Run it, then run the matching copy block below in **the same terminal window**.

macOS / Linux, after setting `dest_parent` from your agent's section:

```sh
if [ -e "$dest_parent/agent-story-video" ] || [ -L "$dest_parent/agent-story-video" ]; then
  echo "Already installed. Compare your existing copy before updating."
else
  mkdir -p "$dest_parent" && cp -R "skills/agent-story-video" "$dest_parent/"
fi
```

Windows PowerShell, after setting `$destParent` from your agent's section:

```powershell
$skillDest = Join-Path $destParent 'agent-story-video'
if (Test-Path -LiteralPath $skillDest) { throw 'Already installed. Compare before updating.' }
New-Item -ItemType Directory -Force -Path $destParent | Out-Null
Copy-Item -LiteralPath 'skills/agent-story-video' -Destination $destParent -Recurse
```

“Already installed” means the old copy was not updated. Save your modifications and compare the two versions first. The final folder must contain `agent-story-video/SKILL.md` directly, not another nested folder with the same name.

These skill locations follow the linked official documentation as checked on 2026-10-21. That is documentation verification only: this skill has been **tested end-to-end in Claude Code (desktop app, macOS)**, not in the other 14 agents. Versions and organization policies may differ. Reopen the session or reload skills if needed.

**What the skill needs from the agent:** permission to run terminal commands on your computer (Node.js 18+, ffmpeg/ffprobe), internet access, and your OpenAI API key for the voice samples and the voice-over. It also needs to run a headless browser for rendering — in sandboxed agents that means allowing those commands outside the sandbox. A browser tool helps with the music search; without one the agent asks you to download 2–4 tracks from Pixabay yourself. A chat-only or cloud agent without access to your computer can help write the story but cannot cast the voice or render the film.

## 1. OpenAI Codex

1. Use the personal destination: `~/.agents/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. In Codex CLI/IDE, type `$agent-story-video` or select it with `/skills`. In the desktop picker, select the installed skill. Project alternative: `.agents/skills/agent-story-video/`.

[Official documentation](https://developers.openai.com/codex/skills/).

## 2. Claude Code

1. Use the personal destination: `~/.claude/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.claude/skills"
```

```powershell
$destParent = Join-Path $HOME '.claude/skills'
```

3. Type `/agent-story-video` followed by your request. Project alternative: `.claude/skills/agent-story-video/`. This local installation does not automatically install the skill into Cowork or cloud sessions.

[Official documentation](https://code.claude.com/docs/en/skills).

## 3. OpenClaw

1. From the downloaded repository, run:

```sh
openclaw skills install ./skills/agent-story-video --as agent-story-video
openclaw skills list
openclaw skills check
```

2. Review trust warnings rather than bypassing them. Confirm installation targets the intended configured agent workspace; use the official CLI agent-selection options when you have several.
3. Ask to use `agent-story-video` and verify discovery. A remote Gateway needs the files and tools in its own execution environment.

[Official documentation](https://docs.openclaw.ai/cli/skills).

## 4. Hermes Agent

1. In your terminal, run:

```sh
hermes skills install eyoussef-builds/agent-story-video/skills/agent-story-video
```

2. Review the community-skill scan and keep normal security checks enabled.
3. Ask Hermes to list skills, then use `agent-story-video`. Default manual destination: `~/.hermes/skills/agent-story-video/`; custom profiles may differ.

[Official documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/).

## 5. Cursor

1. Use the personal destination: `~/.cursor/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.cursor/skills"
```

```powershell
$destParent = Join-Path $HOME '.cursor/skills'
```

3. In Agent chat type `/` and choose `agent-story-video`. Project alternative: `.cursor/skills/agent-story-video/`. Local personal skills need separate supported sync/configuration to reach a cloud worker.

[Official documentation](https://cursor.com/docs/skills).

## 6. Grok Bot

1. This is an **instruction adaptation**, not verified native `SKILL.md` import. Open the Bot and provide this repository link.
2. Ask it to read `skills/agent-story-video/SKILL.md` and relevant references, then save the method as a private skill called `agent-story-video`. Retain supporting files if the host supports them.
3. Verify the saved skill in private-skill/plugin management, enable it for the current Bot if required, and select it with `/` where available. If it cannot read the folder, use the explicit-read fallback below.

[Official documentation](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 7. OpenCode

1. Use the personal destination: `~/.config/opencode/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.config/opencode/skills"
```

```powershell
$destParent = Join-Path $HOME '.config/opencode/skills'
```

3. Ask it to load `agent-story-video` through its skill tool. Project alternative: `.opencode/skills/agent-story-video/`. Check the skill name is listed and its references are readable.

[Official documentation](https://opencode.ai/docs/skills/).

## 8. GitHub Copilot

1. Use the personal destination: `~/.copilot/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.copilot/skills"
```

```powershell
$destParent = Join-Path $HOME '.copilot/skills'
```

3. Use a supported local IDE Agent or Copilot CLI and ask for `agent-story-video`. Project alternative: `.github/skills/agent-story-video/`. Product/version and organization policies affect discovery; a cloud agent cannot read your local files automatically.

[Official documentation](https://docs.github.com/en/copilot/concepts/customizations/agent-skills).

## 9. Gemini CLI

1. Use the personal destination: `~/.gemini/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.gemini/skills"
```

```powershell
$destParent = Join-Path $HOME '.gemini/skills'
```

3. Run `/skills list` in the agent, then ask it to use `agent-story-video`. Reload with `/skills reload` if needed. Project alternative: `.gemini/skills/agent-story-video/`. Keep normal skill activation consent enabled.

[Official documentation](https://geminicli.com/docs/cli/skills/).

## 10. Windsurf / Cascade / Devin Desktop

1. Use the personal destination: `~/.codeium/windsurf/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.codeium/windsurf/skills"
```

```powershell
$destParent = Join-Path $HOME '.codeium/windsurf/skills'
```

3. Ask Cascade to load `agent-story-video` and check discovery. Current docs redirect to Devin Desktop: the preferred project root is `.devin/skills/`, with `.windsurf/skills/` retained for compatibility. Choose the supported root for your installed version.

[Official documentation](https://docs.windsurf.com/windsurf/cascade/skills).

## 11. Cline

1. Use the personal destination: `~/.cline/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.cline/skills"
```

```powershell
$destParent = Join-Path $HOME '.cline/skills'
```

3. Open Cline, confirm skills are enabled in your version, and ask it to use `agent-story-video`. Project alternative: `.cline/skills/agent-story-video/`. Use a mode with the tools needed for the actual task.

[Official documentation](https://docs.cline.bot/customization/skills).

## 12. Roo Code

1. Use the personal destination: `~/.roo/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.roo/skills"
```

```powershell
$destParent = Join-Path $HOME '.roo/skills'
```

3. Ask Roo to load `agent-story-video` using its skill tool. Project alternative: `.roo/skills/agent-story-video/`. Use the generic skill root unless you intentionally want mode-specific scoping.

[Official documentation](https://roocodeinc.github.io/Roo-Code/advanced-usage/available-tools/skill/).

## 13. Aider

1. Use **read-only context**, not an assumed native skill installer. From the repository, run:

```sh
aider --read skills/agent-story-video/SKILL.md
```

2. Add relevant reference files with `/read` and their paths under `skills/agent-story-video/references/`; add helpers when needed.
3. Ask it to follow the skill with only authorized inputs. Reading text does not add missing chat tools, browser/image services or execution permissions.

[Official documentation](https://aider.chat/docs/usage/tips.html).

## 14. Amp

1. Use the personal destination: `~/.agents/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. Ask Amp to list/load `agent-story-video`. Project alternative: `.agents/skills/agent-story-video/`. Check your configuration has not disabled global agent-skills discovery.

[Official documentation](https://ampcode.com/docs/customize/skills).

## 15. Goose

1. Use the personal destination: `~/.agents/skills/agent-story-video/`.
2. Run your system's line, then the copy block in step 2 above:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. Keep the Skills extension enabled. Check `goose skills list`, then use `/skills agent-story-video` in chat. Project alternative: `.agents/skills/agent-story-video/`. File/terminal work needs suitable tool extensions.

[Official documentation](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/context-engineering/using-skills.md).

## 3. Check that it works

1. Start a new session or reload skills if it is missing.
2. Ask: “Can you see `agent-story-video`? Read its instructions and check that Node.js, ffmpeg and git are installed here.”
3. Check it reads the complete skill folder (including `template/`) rather than another similarly named file.
4. Use the first-video prompt in [the main explanation](../README.md). If a required tool is missing, the agent must say so rather than invent a successful result.

## Any other agent: explicit reading

Download/open the repository in a workspace the agent can read, then say:

```text
Read skills/agent-story-video/SKILL.md and follow it for this task.
Read linked references when needed and inspect helpers before running them.
Respect my current permissions and explain any unavailable tools.
```

For a chat-only agent, attach the entrypoint and necessary references if attachments are supported. That enables planning a storyboard and narration, not rendering videos on your computer.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Skill does not appear | Check the supported directory, uppercase `SKILL.md`, and no extra nesting. Reload skills. |
| It does not trigger automatically | Name it explicitly or use the agent's own invocation control. |
| The installed copy is old | Compare versions and preserve your changes (such as `brand.json`) and your local profile before updating. |
| Two copies share a name | Keep the intended location and remove the duplicate after preserving changes. |
| A cloud session cannot see local files | Use a local environment or actually accessible authorized source; do not assume automatic sync. |
| Organization policy blocks skills | Use the supported setup with your administrator; do not bypass the restriction. |
| You want to uninstall | Remove only the installed `agent-story-video` folder or use the agent's uninstall control; leave your project files alone. |

---

Created by [eyoussef-builds](https://github.com/eyoussef-builds) · [hello@eyoussef.me](mailto:hello@eyoussef.me) · [eyoussef.me](https://eyoussef.me)
