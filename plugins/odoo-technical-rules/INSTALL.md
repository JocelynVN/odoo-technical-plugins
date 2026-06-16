# Installation guide — odoo-technical-rules

The installer writes the rules into each agent's **always-on instructions file**
so they load at the start of every session — `AGENTS.md` for Codex & Cursor,
`CLAUDE.md` for Claude Code. The rules go in a marker-wrapped block, so the rest
of your file is left untouched.

## ⚡ Install

Run from your Odoo project:

```bash
npx odoo-technical-plugins@latest                       # interactive: pick plugin + agent + scope
npx odoo-technical-plugins@latest --agent all           # this project, every agent
npx odoo-technical-plugins@latest --agent cursor
npx odoo-technical-plugins@latest --agent codex --global
npx odoo-technical-plugins@latest --list                # list plugins
```

> The `@latest` tag bypasses npx's cache so you always pull the newest version.
> Prefer the GitHub source over npm? `npx github:JocelynVN/odoo-technical-plugins -- <flags>` works identically.

### Where it installs

| Agent | Project | Global (`--global`) |
|-------|---------|---------------------|
| Codex | `AGENTS.md` | `~/.codex/AGENTS.md` |
| Cursor | `AGENTS.md` | `~/.cursor/rules/odoo-technical-rules.mdc` |
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` |

`AGENTS.md` is the cross-tool standard (Codex + Cursor read it); Claude Code
uses `CLAUDE.md`. Each install is a `<!-- BEGIN/END odoo-technical-rules -->`
block, so other content in those files is preserved.

## Manage it (update · uninstall · status)

Installs are tracked in a manifest (`.odoo-technical-plugins.json` per project,
`~/.odoo-technical-plugins.json` with `--global`):

```bash
npx odoo-technical-plugins status                 # what's installed (project + global)
npx odoo-technical-plugins@latest update          # refresh installed rules to the latest
npx odoo-technical-plugins@latest update --global
npx odoo-technical-plugins uninstall              # remove everything tracked here
npx odoo-technical-plugins uninstall --agent cursor
npx odoo-technical-plugins uninstall --global --yes
```

`update` rewrites each tracked block in place with the latest version's rules
(use `@latest` so npx fetches the newest package, not a cached one). `uninstall`/
`status` also detect installs on disk even without a manifest (e.g. made by an
older version), so cleanup stays reliable.

## Manual install

The rules are plain Markdown — paste them yourself if you prefer. The text is the
body of [`skills/odoo-technical-rules/SKILL.md`](skills/odoo-technical-rules/SKILL.md)
(below the frontmatter). Add it to your project's `AGENTS.md` (Codex/Cursor) and/or
`CLAUDE.md` (Claude Code).

## Customizing for your team

> ⚠️ **`update` overwrites the managed block.** The installed rules live between
> `<!-- BEGIN odoo-technical-rules -->` and `<!-- END odoo-technical-rules -->`.
> Running `update` replaces everything inside those markers, so **don't edit
> inside the block** — any changes there (e.g. replacing `<prefix>`) are lost on
> the next update.
>
> Put team-specific rules and overrides **outside** the markers (elsewhere in
> your `AGENTS.md` / `CLAUDE.md`) — that content is never touched by
> `update`/`uninstall`. If you need to change the rule text itself, fork the
> plugin instead.

The full ruleset lives in [`rules/technical-rules.en.md`](rules/technical-rules.en.md) /
[`rules/technical-rules.vi.md`](rules/technical-rules.vi.md). Placeholders to adapt:
`<prefix>` → your module prefix, `<odoo_version>` → your target version.
