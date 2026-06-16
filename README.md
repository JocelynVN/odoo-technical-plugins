# Odoo Technical Plugins

A **marketplace of technical plugins for Odoo development**, installable by AI coding agents (Claude Code, Codex, Cursor).

This repository is a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins): the root holds the marketplace manifest, and each plugin is self-contained under [`plugins/`](plugins).

## Plugins

| Plugin | Description | Docs |
|--------|-------------|------|
| [`odoo-technical-rules`](plugins/odoo-technical-rules) | General, vendor-neutral Odoo coding rules (naming, manifest, views, Python/ORM, security, commits, stable policy). VI + EN. | [README](plugins/odoo-technical-rules/README.md) · [Install](plugins/odoo-technical-rules/INSTALL.md) |

> More plugins will be added here over time.

## Install the marketplace (Claude Code)

```bash
/plugin marketplace add JocelynVN/odoo-technical-plugins
/plugin install odoo-technical-rules@odoo-technical-plugins
```

Then browse available plugins with `/plugin`. For Codex and Cursor, each plugin ships its own ready-to-copy files — see that plugin's `INSTALL.md`.

## Repository layout

```text
.claude-plugin/
  marketplace.json            # lists every plugin in this repo
plugins/
  odoo-technical-rules/       # plugin #1 (self-contained)
    .claude-plugin/plugin.json
    skills/                   # Claude Code skill
    rules/                    # full ruleset (en + vi) — single source of truth
    dist/                     # ready-to-copy configs for Codex & Cursor
    README.md
    INSTALL.md
```

## Adding a new plugin

1. Create `plugins/<your-plugin>/` with its own `.claude-plugin/plugin.json`.
2. Add an entry to `.claude-plugin/marketplace.json` → `plugins[]`.
3. Add a row to the **Plugins** table above.
