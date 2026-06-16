# Odoo Technical Rules

A general, **vendor-neutral** technical ruleset for Odoo module development. Fork it and adapt it to your team/project.

## 📖 Read the rules

| Language | File |
|----------|------|
| 🇻🇳 Tiếng Việt | [technical-rules.vi.md](technical-rules.vi.md) |
| 🇬🇧 English | [technical-rules.en.md](technical-rules.en.md) |

Both versions have identical content and cross-link to each other.

## 🔌 Install as an AI-agent plugin

These rules ship ready to install for **Claude Code**, **Codex**, and **Cursor** — see **[INSTALL.md](INSTALL.md)** for per-agent steps.

Quick start for Claude Code:

```bash
/plugin marketplace add JocelynVN/odoo-technical-rules
/plugin install odoo-technical-rules@odoo-technical-rules
```

| Agent | Format | Path |
|-------|--------|------|
| Claude Code | Plugin (marketplace + skill) | [`plugins/odoo-technical-rules/`](plugins/odoo-technical-rules) |
| Codex | `AGENTS.md` | [`dist/codex/AGENTS.md`](dist/codex/AGENTS.md) |
| Cursor | Project rule (`.mdc`) | [`dist/cursor/.cursor/rules/odoo-technical-rules.mdc`](dist/cursor/.cursor/rules/odoo-technical-rules.mdc) |

## What's inside

Conventions and best practices covering: development environment, source control, module & manifest structure, directory/file layout, models & fields, XML/views/data, Python, JavaScript & CSS, security, automation tests, external dependencies, migrations & hooks, UX/UI, i18n, commit messages, pull requests, branch naming, and stable-version policy.

## License

These rules are documentation — adapt freely. Add your team's own conventions at the end of either file as needed.
