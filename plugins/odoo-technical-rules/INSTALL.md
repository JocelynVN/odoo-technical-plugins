# Installation guide — odoo-technical-rules

This plugin ships the Odoo technical rules in formats installable by **Claude Code**, **Codex**, and **Cursor**. Paths below are relative to this plugin folder (`plugins/odoo-technical-rules/`).

| Agent | Format | Path |
|-------|--------|------|
| Claude Code | Skill (copied to `.claude/skills/`) | `skills/odoo-technical-rules/SKILL.md` |
| Codex | `AGENTS.md` | `dist/codex/AGENTS.md` |
| Cursor | Project rule (`.mdc`) | `dist/cursor/.cursor/rules/odoo-technical-rules.mdc` |

The full ruleset lives in **one place** — [`rules/technical-rules.en.md`](rules/technical-rules.en.md) / [`rules/technical-rules.vi.md`](rules/technical-rules.vi.md). Each agent format embeds the same must-follow checklist and links back to these full docs (no duplicated copies).

---

## ⚡ Recommended: one interactive command

Run from your Odoo project:

```bash
npx odoo-technical-plugins
```

It prompts for the plugin, the agent (Claude Code / Codex / Cursor / all), and the scope, then writes the right files. Non-interactive:

```bash
npx odoo-technical-plugins --agent all            # this project
npx odoo-technical-plugins --agent cursor
npx odoo-technical-plugins --agent codex --global
npx odoo-technical-plugins --list                 # list plugins
```

> Prefer the GitHub source over npm? `npx github:JocelynVN/odoo-technical-plugins -- <flags>` works identically.

This is idempotent and append-safe (won't duplicate an existing `AGENTS.md`).

### Manage it (install · update · uninstall · status)

The CLI tracks what it installed in a manifest (`.odoo-technical-plugins.json` per project, or `~/.odoo-technical-plugins.json` with `--global`), so updates and removals are clean:

```bash
npx odoo-technical-plugins status                 # what's installed (project + global)
npx odoo-technical-plugins update                 # refresh installed files to the latest
npx odoo-technical-plugins update --global
npx odoo-technical-plugins uninstall              # remove everything tracked here
npx odoo-technical-plugins uninstall --agent cursor   # remove just one agent
npx odoo-technical-plugins uninstall --global --yes
```

Uninstall removes our Cursor rule / Claude skill outright and strips only our
marker-wrapped block from a shared `AGENTS.md` (your other content stays).

> Prefer no Node? There's also a bash script for Codex & Cursor:
> ```bash
> curl -fsSL https://raw.githubusercontent.com/JocelynVN/odoo-technical-plugins/main/plugins/odoo-technical-rules/install.sh | bash
> ```
> Usage: `install.sh <codex|cursor|all> [project-dir|global]`.

The sections below document where each installer writes files and the fully manual steps.

---

## 🟣 Claude Code

The installer copies the skill into Claude Code's skills directory:

- per project → `<project>/.claude/skills/odoo-technical-rules/`
- global → `~/.claude/skills/odoo-technical-rules/`

```bash
npx odoo-technical-plugins --agent claude            # this project
npx odoo-technical-plugins --agent claude --global   # all projects
```

The skill `odoo-technical-rules` activates automatically whenever you work on Odoo code (manifest, models, views, security…), and can be invoked explicitly with `/odoo-technical-rules`.

### Manual (copy the skill yourself)

```bash
mkdir -p /path/to/your-odoo-project/.claude/skills
cp -r skills/odoo-technical-rules /path/to/your-odoo-project/.claude/skills/
```

> Claude Code also reads `AGENTS.md` at the project root, so the Codex file below works for Claude Code too.

---

## 🟢 Codex (OpenAI Codex CLI)

Codex reads `AGENTS.md` — at the repo root (per-project) or `~/.codex/AGENTS.md` (global).

### Per project

```bash
cp dist/codex/AGENTS.md /path/to/your-odoo-project/AGENTS.md
```

If the project already has an `AGENTS.md`, append instead of overwriting:

```bash
printf '\n\n' >> /path/to/your-odoo-project/AGENTS.md
cat dist/codex/AGENTS.md >> /path/to/your-odoo-project/AGENTS.md
```

### Global (all projects)

```bash
mkdir -p ~/.codex
cp dist/codex/AGENTS.md ~/.codex/AGENTS.md
```

Codex picks it up automatically on the next session.

---

## 🔵 Cursor

Cursor reads **Project Rules** from `.cursor/rules/*.mdc`.

### Per project

```bash
mkdir -p /path/to/your-odoo-project/.cursor/rules
cp dist/cursor/.cursor/rules/odoo-technical-rules.mdc \
   /path/to/your-odoo-project/.cursor/rules/
```

Reload Cursor. The rule is scoped via `globs` to Odoo files (manifest, `models/`, `views/`, `security/`, `static/src/`) and applies automatically when those files are in context. To force it on for every request, open the `.mdc` and set `alwaysApply: true`.

### Global (all projects)

The installers write the rule to `~/.cursor/rules/odoo-technical-rules.mdc` (Cursor's user-level config dir), so it applies across every project — no manual copy:

```bash
npx odoo-technical-plugins --agent cursor --global
```

> If your Cursor version doesn't pick up `~/.cursor/rules`, you can still paste the body of the `.mdc` into **Settings → Rules → User Rules**.

---

## Updating

When the rules change, re-pull this repo and:

- **Any agent**: `npx odoo-technical-plugins update` (or `--global`).
- Manual copies: re-copy the file.

## Customizing for your team

Replace the placeholders in the copied files:
- `<prefix>` → your module prefix (e.g. `acme_`)
- `<odoo_version>` → your target version (e.g. `17.0`)

Add team-specific conventions at the end of each file.
