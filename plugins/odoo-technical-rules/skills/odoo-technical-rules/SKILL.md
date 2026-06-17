---
name: odoo-technical-rules
description: Apply the project's general Odoo technical rules when writing, modifying, or reviewing Odoo module code — module/manifest naming, directory & per-component static layout, models & fields, XML/views (minimum list+kanban+form+search), Python & ORM safety, docstrings (flake8-docstrings/PEP 257), security, tests, commit messages, branch names, pull-request titles, and stable-version policy. Use whenever the task touches an Odoo addon (`__manifest__.py`, `models/`, `views/`, `.xml`, `ir.model.access.csv`, etc.).
---

# Odoo Technical Rules

You are working in an Odoo codebase. Follow the rules below for any code you write or review. The checklist here is the canonical summary; for full detail and examples, read the complete ruleset:

- English: https://github.com/JocelynVN/odoo-technical-plugins/blob/main/plugins/odoo-technical-rules/rules/technical-rules.en.md
- Tiếng Việt: https://github.com/JocelynVN/odoo-technical-plugins/blob/main/plugins/odoo-technical-rules/rules/technical-rules.vi.md

Consult those (links above) before a non-trivial change. The checklist below is enough for everyday work.

## Must-follow checklist

**Module & manifest**
- Technical name: lowercase `[a-z0-9_]`, team prefix `<prefix>_`. Extensions: `<prefix>_<base_module>_<feature>` (e.g. `acme_sale_discount`). Localization: `l10n_<cc>_<prefix>_xxx` (e.g. `l10n_vn_acme_einvoice`).
- `summary` ≤ 158 chars; `description` in Markdown. New module version `<odoo_version>.1.0.0` (e.g. `18.0.1.0.0`); bump version **only** when a migration ships. `depends` only on modules actually used.

**Layout**
- Split files per model (`models/<model>.py`, `views/<model>_views.xml`, ...).
- **Static is packaged per component**: an OWL component's js + xml + scss live together in `static/src/components/<component_name>/`, **not** split into `js/`, `xml/`, `scss/` folders.

**Models & fields**
- New models must set `_description`. Many2one → `_id`, One2many/Many2many → `_ids` (e.g. `partner_id = fields.Many2one("res.partner")`, `line_ids = fields.One2many(...)`).
- Every field needs `string`; add `help` whenever meaning isn't obvious (e.g. `amount = fields.Monetary(string="Total", help="Untaxed amount plus tax.")`).

**Views**
- Provide at least 4 views: `list`, `kanban` (for mobile), `form`, `search`.
- `id` before `model` (e.g. `<record id="view_sale_order_form" model="ir.ui.view">`); inside a `<field>` the `name` attribute comes first. Reuse the parent view's xml_id for inherits. Avoid `position="replace"` (if unavoidable: comment why + `priority` > 100).

**Python & ORM**
- Keep import order and in-model declaration order (private attrs → fields → defaults → compute/search → constraints/onchange → CRUD → actions → business).
- Method naming by purpose: `_compute_`, `_inverse_`, `_search_`, `_default_`, `_onchange_`, `_check_` (e.g. `_compute_amount_total`, `_check_date_range`).
- Never build SQL via string concatenation — use parameterized queries: `self.env.cr.execute("SELECT id FROM sale_order WHERE id IN %s", [tuple(ids)])`. Don't bypass the ORM if `search`/`read` can do it (document with a docstring if you must).
- Validate with `@api.constrains("date_start", "date_end")`, not `onchange` (onchange may only warn).
- **Docstrings**: mandatory on public methods; must pass `flake8-docstrings` (PEP 257) — triple double-quotes, imperative summary ending in a period, blank line before the body (e.g. `"""Confirm the order and reserve stock."""`).
- **Quotes**: double quotes `"..."` for any string **shown to a user** — the argument of `_()` (or `self.env._()`), messages in `UserError` / `ValidationError` / etc., and a field's `string` / `help` (e.g. `raise ValidationError(_("Login failed"))`). Single quotes `'...'` for everything else (plain strings, dict/list/tuple keys). `"""..."""` for docstrings.

**Security**
- Define access in `ir.model.access.csv`; declare groups and record rules in `security.xml` with same-model rules kept contiguous.

**Tests**
- Scenario-based; reuse demo data; use `@example.com` emails. Update tests when computation logic changes.

**Commits & branches**
- English commits prefixed `[IMP] [FIX] [ADD] [REM] [REN] [MIG] [UPG] [I18N] [MERGE] [MISC]`, with the module name in the title (e.g. `[FIX] sale_discount: prevent negative percentage`).
- Branch: `v<odoo_version>_<fix|upg|add|rem|imp>_<module_name>` or `v<odoo_version>_<feature_name>` (e.g. `v18.0_fix_sale_discount`).
- PR title: Odoo version then the commit prefix (brackets joined, no space) + module name: `[<odoo_version>][<PREFIX>] <module_name>` (e.g. `[18.0][IMP] sale_discount`). Use `[WIP]` while in progress.

**Stable policy**
- On released versions (`16.0`, `17.0`, ...): no schema/data-model changes, no method renames, no xml_id changes or data-record deletions, no new required args. When logic affects existing data, write a migration in the module.

## Required workflow

Whenever a task touches Odoo code, before you report it as done you MUST:

1. Re-read the checklist above and verify your changes comply with every applicable item.
2. Fix any violation you find. If something can't comply, state the reason explicitly.

Do not consider the task complete while a known rule is violated.
