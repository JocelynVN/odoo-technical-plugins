# Installation guide — odoo-technical-rules

This plugin is an **Agent Skill** (`SKILL.md`). Claude Code, Codex, and Cursor all
support the Agent Skills standard, so one installer covers all three — it copies
the skill folder into the agent's skills directory.

## ⚡ Install

Run from your Odoo project:

```bash
npx odoo-technical-plugins                       # interactive: pick plugin + agent + scope
npx odoo-technical-plugins --agent all           # this project, every agent
npx odoo-technical-plugins --agent cursor
npx odoo-technical-plugins --agent codex --global
npx odoo-technical-plugins --list                # list plugins
```

> Prefer the GitHub source over npm? `npx github:JocelynVN/odoo-technical-plugins -- <flags>` works identically.

### Where it installs

| Agent | Project | Global (`--global`) |
|-------|---------|---------------------|
| Claude Code | `.claude/skills/odoo-technical-rules/` | `~/.claude/skills/odoo-technical-rules/` |
| Codex | `.codex/skills/odoo-technical-rules/` | `~/.codex/skills/odoo-technical-rules/` |
| Cursor | `.cursor/skills/odoo-technical-rules/` | `~/.cursor/skills/odoo-technical-rules/` |

All three read the same `SKILL.md`. (Cursor and Codex also auto-discover
`.claude/skills/`, so a single Claude install is often picked up cross-tool.)

## Manage it (update · uninstall · status)

Installs are tracked in a manifest (`.odoo-technical-plugins.json` per project,
`~/.odoo-technical-plugins.json` with `--global`):

```bash
npx odoo-technical-plugins status                 # what's installed (project + global)
npx odoo-technical-plugins update                 # refresh installed skills to the latest
npx odoo-technical-plugins update --global
npx odoo-technical-plugins uninstall              # remove everything tracked here
npx odoo-technical-plugins uninstall --agent cursor
npx odoo-technical-plugins uninstall --global --yes
```

`uninstall`/`status` also detect installs on disk even without a manifest (e.g.
made by an older version), so cleanup stays reliable.

## Manual install

The skill is just a folder — copy it yourself if you prefer:

```bash
mkdir -p /path/to/your-odoo-project/.claude/skills
cp -r skills/odoo-technical-rules /path/to/your-odoo-project/.claude/skills/
# or .codex/skills/ , or .cursor/skills/
```

## Customizing for your team

The full ruleset lives in [`rules/technical-rules.en.md`](rules/technical-rules.en.md) /
[`rules/technical-rules.vi.md`](rules/technical-rules.vi.md). Replace placeholders:
`<prefix>` → your module prefix, `<odoo_version>` → your target version.
