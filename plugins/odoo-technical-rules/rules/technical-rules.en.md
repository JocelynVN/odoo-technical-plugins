# Odoo Technical Rules

> 🌐 Language: **English** · [Tiếng Việt](technical-rules.vi.md)
>
> A general-purpose technical ruleset for Odoo module development. This document is **not tied to any specific company** — fork it and adapt it to your team/project.
>
> **Placeholder conventions used in this document:**
> - `<prefix>` — your team's module prefix (e.g. `acme_`). Replace with your actual prefix.
> - `<odoo_version>` — the Odoo version (e.g. `17.0`).
> - `<module_name>`, `<model_name>` — the technical name of the corresponding module/model.

## Table of contents

1. [Development environment](#1-development-environment)
2. [Source control](#2-source-control)
3. [Module](#3-module)
4. [Directory & file structure](#4-directory--file-structure)
5. [Models & Fields](#5-models--fields)
6. [XML / Views / Data](#6-xml--views--data)
7. [Python](#7-python)
8. [JavaScript & CSS](#8-javascript--css)
9. [Security](#9-security)
10. [Automation tests](#10-automation-tests)
11. [External dependencies](#11-external-dependencies)
12. [Migrations & Hooks](#12-migrations--hooks)
13. [UX & UI](#13-ux--ui)
14. [i18n](#14-i18n)
15. [Commit message](#15-commit-message)
16. [Pull request](#16-pull-request)
17. [Branch name](#17-branch-name)
18. [Stable policy](#18-stable-policy)
19. [Other conventions](#19-other-conventions)

---

## 1. Development environment

### Python & PostgreSQL

- Use the **exact Python and PostgreSQL versions** required by the Odoo version you are developing for (refer to Odoo's official docs for each version).
- Each Odoo version should have its **own Python virtual environment** (`venv`) to avoid library conflicts.
- Install dependencies from the `requirements.txt` of both Odoo and the current repository.

### Tooling

- **IDE is optional** — not mandated. It is recommended to configure a shared linter/formatter across the team for consistent code:
  - Python: `flake8` / `pylint-odoo`, `black` (if the team agrees).
  - XML/JS: `prettier` or equivalent.
- Configure `EditorConfig` at the repo root to unify indentation, charset, and line endings across members.

---

## 2. Source control

### Repository organization

- Each version of a repository maps to **one branch** (e.g. `17.0`, `18.0`).
- Declare all dependent repositories (Odoo core, OCA, themes, shared addons...) on the branch matching the version under development.
- Keep a consistent local directory layout across the team, e.g. `~/git/<repo_name>/<repo_name><version>`.

### Principles

- **Do not edit the Odoo core fork directly** (except translation file fixes/updates, or when explicitly directed by the maintainer). Any behavioral change belongs in a separate addon.

---

## 3. Module

### Technical name

- The technical name is **lowercase, no accents, separated by `_`**, using only `[a-z0-9_]`.
- Use a **consistent prefix** for all of the team's modules, e.g. `<prefix>_`. This avoids name clashes with Odoo/OCA modules and aids recognition.
- When **inheriting/extending** another module, name it `<prefix>_<base_module>_<feature>`. For example, extending `hr_expense` → `<prefix>_hr_expense_xxx`.
- **Localization** modules use Odoo's standard prefix: `l10n_<country_code>_<prefix>_xxx`. For example: `l10n_vn_<prefix>_accounting`.

### Manifest (`__manifest__.py`)

The manifest describes the module's value and is the basis for users to decide on installation. Important keys:

| Key | Rule |
|-----|------|
| `name` | Display name (English), short, clear, user-friendly. |
| `summary` | A short description highlighting the **value** the module brings (not a list of technical features). Keep it **≤ 158 chars** if used as a meta title. |
| `description` | Detailed description in **Markdown**: what does it do? why use it? when to use it? who uses it? Avoid overly technical jargon. |
| `author` | Author/organization name. |
| `website` | URL of the module's product/documentation page. |
| `category` | The correct business category. |
| `version` | New modules start at `<odoo_version>.1.0.0`. Only bump the version when there is a **migration**. Do not change the version without writing a migration. |
| `depends` | Only depend on modules whose code/features you **actually use**. Don't depend just to "borrow" a menu. |
| `installable` | Defaults to `True`; set `False` if the module is not ready. |
| `license` | Declare the license explicitly (`LGPL-3`, `OPL-1`, ...). |
| `application` | `True` if it's an app, otherwise `False` (default). |
| `auto_install` | `True` for **bridge** modules between other modules; otherwise `False`. |
| `external_dependencies` | Mandatory if using external Python/binary libraries (see [section 11](#11-external-dependencies)). |
| `images` | Representative image in `static/description/`, e.g. `['static/description/main_screenshot.png']`. |

> **Versioning note:** keep `version` stable within the same release line; only bump it when an actual migration script accompanies it.

### Renaming a module

- **Never** rename a module's technical name after it has been set `installable: True` and released.
- If a rename is unavoidable, do it only in a later upgrade version and declare the **`old_technical_name`** key (set to the previous technical name) in the manifest to support migration/rename.

---

## 4. Directory & file structure

### Standard directory structure

```text
/<module_name>/
|-- __init__.py
|-- __manifest__.py
|-- hooks.py
|-- controllers/
|   |-- __init__.py
|   `-- main.py
|-- data/
|   `-- <model_name>_data.xml
|-- demo/
|   `-- <model_name>_demo.xml
|-- migrations/
|   `-- <odoo_version>.x.y.z/
|       |-- pre-migration.py
|       `-- post-migration.py
|-- models/
|   |-- __init__.py
|   `-- <model_name>.py
|-- report/
|   |-- __init__.py
|   |-- report.xml
|   `-- <model_name>_report.py
|-- security/
|   |-- ir.model.access.csv
|   `-- security.xml
|-- static/
|   |-- description/
|   |   |-- icon.png
|   |   `-- index.html
|   |-- img/
|   |-- lib/
|   `-- src/
|       |-- components/
|       |   `-- <component_name>/        # packaged per component
|       |       |-- <component_name>.js
|       |       |-- <component_name>.xml
|       |       `-- <component_name>.scss
|       |-- scss/                        # module-wide styles (not part of any component)
|       `-- js/                          # shared logic, services, utils... (not part of any component)
|-- tests/
|   |-- __init__.py
|   `-- test_<feature>.py
|-- views/
|   `-- <model_name>_views.xml
|-- templates/
|   `-- <model_name>_templates.xml
`-- wizard/
    |-- __init__.py
    |-- <model_name>.py
    `-- <model_name>_views.xml
```

### File naming

- Use only `[a-z0-9_]`.
- **Split files per model**: one Python file, one views file, one data file per model...
  - `models/<model_name>.py`
  - `views/<model_name>_views.xml`
  - `data/<model_name>_data.xml`
  - `demo/<model_name>_demo.xml`
  - `templates/<model_name>_templates.xml`
- **One2many exception**: the child line view (e.g. `sale.order.line`) may live in the same view file as the parent model (`sale.order`), but the Python file must still be **separate**.
- **Controller**: if there's only one file, name it `main.py`; if more, split by responsibility.
- **Static — package per component, not by file type.** An OWL component spanning multiple files (js + xml + scss) should be grouped into **a single `<component_name>/` folder** rather than scattering each file type into separate `js/`, `xml/`, `scss/` folders. Splitting by file type scatters the parts of one component far apart, making it hard to manage and maintain.

  ```text
  # PREFER — everything for a component lives together
  static/src/components/task_card/
  |-- task_card.js
  |-- task_card.xml
  `-- task_card.scss

  # AVOID — split apart by file type
  static/src/js/task_card.js
  static/src/xml/task_card.xml
  static/src/scss/task_card.scss
  ```

  - A component's files share the component's name (`<component_name>.js`, `<component_name>.xml`, `<component_name>.scss`).
  - Keep top-level `src/scss/` and `src/js/` only for **module-wide shared styles/logic** (not tied to a specific component), e.g. shared SCSS variables, services, utils.
  - In `__manifest__.py`, you can declare assets via glob to gather the whole component folder, e.g. `'<module_name>/static/src/components/**/*'`.

---

## 5. Models & Fields

### Model name

- Lowercase, dot-separated: `account.move`.
- Use the **singular**: `account.invoice` rather than `account.invoices`.

### Description

- Every **newly created** model must have the **`_description`** attribute.

### Field naming

- `Many2one` fields end with **`_id`**.
- `One2many` / `Many2many` fields end with **`_ids`**.

### Field attributes

- **`string`**: mandatory for every field. Keep it short; avoid wrapping to ≥ 2 lines in views.
- **`help`**: mandatory for any field whose meaning is **not obvious** from `string` (computed fields, fields with business constraints, fields affecting other behavior...). The help should convey: what does the field mean? when to use it? why use it? any warnings? You may omit `help` only when `string` is fully self-explanatory (e.g. `name`, `active`).
- **`related`**: once `related`, don't re-declare other attributes unless overriding or adding. If related to a `required` field, you must set `store=False` or `readonly=False`.

---

## 6. XML / Views / Data

### Minimum set of views

When designing views for a model with an end-user interface, you must provide **at least the 4 basic views**:

| View | Purpose |
|------|---------|
| `list` (tree) | Browse many records; the default view of most actions. |
| `kanban` | **Mandatory** — ensures a good experience on **mobile**, where list views render poorly. |
| `form` | View/enter the details of a single record. |
| `search` | Provides filters and group-by (see [Filter & Group](#filter--group)). |

- The model's main action should declare the matching modes, e.g. `view_mode="list,kanban,form"`, and attach a `search_view_id`.
- Exception: auxiliary models (technical models, wizards, One2many child lines not accessed directly...) don't require all 4 views — only the views actually used.

### Record conventions

- The `id` attribute comes **before** `model`.
- For `<field>`, the `name` attribute comes **first**, then others such as `widget`, `options`...
- xml_id references **within the same module** don't need the `module_name.` prefix (only add it when referencing another module).
- Demo records should carry a suffix to distinguish them from regular records (e.g. `..._demo`).

### xml_id — naming conventions

| Type | Format | Example |
|------|--------|---------|
| Data record | `<model_name>_<record_name>` | `res_users_important_person` |
| View | `<model_name>_view_<view_type>` | `sale_order_view_form` |
| Main action | `<model_name>_action` | `sale_order_action` |
| Secondary action | `<model_name>_action_<xxx>` | `sale_order_action_draft` |
| Group | `<module_name>_group_<group_name>` | `<prefix>_sale_group_manager` |
| Record rule | `<model_name>_rule_<concerned_group>` | `sale_order_rule_company` |

### Inherited XML (view inheritance)

- Within **one module**, extend a given view **only once**. To add several fields, group them into **one** inherit view; don't create multiple small views.
- The inherited view's xml_id should **reuse the original view's ID** to make all inheritances easy to trace.
- **Minimize `position="replace"`** — it easily causes `Element ... cannot be located in parent view` errors for other modules/views. If you must use it:
  - Add a comment explaining why.
  - Set a high `priority` (> 100) to reduce conflict risk.

```xml
<record id="sale_order_view_form" model="ir.ui.view">
    <field name="name">sale.order.view.form.inherit</field>
    <field name="model">sale.order</field>
    <field name="priority">110</field> <!-- Priority > 100 -->
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <!-- Must replace because ... -->
        <xpath expr="//field[@name='my_field_1']" position="replace"/>
    </field>
</record>
```

### QWeb

- Don't use `t-x-options` (such as `t-field-options`), removed in recent Odoo versions — use the syntax current for your version.

### Menu

- Root menus without an action should live in a dedicated file (e.g. `root_menu.xml`).
- A menu tied to a model goes in that model's view file.
- App menus must have a **`web_icon`**.

### Filter & Group

- Filter names use the **`ftr_`** prefix, group-by names use the **`grp_`** prefix (optional convention, but be consistent across the team).
- When designing views, always think about sensible filters and group-by. E.g. a model with `department_id` should have a group-by Department; with a `state`, a filter by state.

---

## 7. Python

### Import order

```python
# 1: Python standard library
import base64
import logging
import re

# 2: known third-party libraries
import lxml

# 3: Odoo imports
import odoo
from odoo import api, fields, models  # alphabetically ordered
from odoo.tools.safe_eval import safe_eval
from odoo.tools.translate import _

# 4: imports from other Odoo modules
from odoo.addons.web.controllers.main import Home

# 5: local imports
from . import utils

# 6: unknown third-party libraries
_logger = logging.getLogger(__name__)
try:
    import external_dependency_python_N
except ImportError:
    _logger.debug('Cannot `import external_dependency_python_N`.')
```

### Declaration order within a model

1. Private attributes: `_name`, `_description`, `_inherit`.
2. Default methods: `_default_<field_name>`.
3. Field declarations.
4. `_sql_constraints`.
5. `_default_get`.
6. Compute & search methods.
7. Constraints & onchange.
8. CRUD methods (ORM overrides).
9. Action methods.
10. Other business methods.

```python
class Event(models.Model):
    # Private attributes
    _name = 'event.event'
    _description = 'Event'

    # Fields
    name = fields.Char(default=lambda self: self._default_name())
    seats_reserved = fields.Integer(
        string='Reserved Seats', store=True, readonly=True,
        compute='_compute_seats',
    )

    # Default methods
    def _default_name(self):
        ...

    # Compute / search (same order as field declarations)
    @api.depends('seats_max', 'registration_ids.state')
    def _compute_seats(self):
        ...

    # Constraints & onchange
    @api.constrains('seats_max')
    def _check_seats_limit(self):
        ...

    @api.onchange('date_begin')
    def _onchange_date_begin(self):
        ...

    # CRUD
    def create(self, vals_list):
        ...

    # Actions
    def action_validate(self):
        self.ensure_one()
        ...

    # Business methods
    def mail_user_confirm(self):
        ...
```

### Method naming conventions

| Type | Format |
|------|--------|
| Compute | `_compute_<field_name>` |
| Inverse | `_inverse_<field_name>` |
| Search | `_search_<field_name>` |
| Default | `_default_<field_name>` |
| Onchange | `_onchange_<field_name>` |
| Constraint | `_check_<constraint_name>` |

### No SQL injection

**NEVER** use string concatenation to inject variables into SQL.

```python
# VERY BAD — SQL injection vulnerability
cr.execute('SELECT ... WHERE parent_id IN (' + ','.join(map(str, ids)) + ')')

# CORRECT — parameterized
cr.execute('SELECT DISTINCT child_id FROM rel WHERE parent_id IN %s', (tuple(ids),))
```

- **Don't use `AsIs`** on unprocessed/unescaped input.

### Don't bypass the ORM

- Don't query SQL directly if the ORM can do the same thing.

```python
# WRONG
cr.execute("SELECT id FROM auction_lots WHERE state=%s AND obj_price>0", ('draft',))

# CORRECT
records = self.search([('state', '=', 'draft'), ('obj_price', '>', 0)])
```

- If you must bypass the ORM (e.g. for performance), include a **docstring explaining why**.

### Data validation

- **Don't use `onchange` to validate** — onchange only runs in the view, and data can still be saved even if the condition fails.
- Use **`@api.constrains`** to validate; onchange should only **warn** or suggest values.

### Docstrings

- **Mandatory** for every **public** method (actions, business methods, APIs consumed by other modules, ORM overrides like `create`/`write`/`unlink`). The docstring should state what the method does, key parameters, return value, and notable side effects if any.
- **Encouraged** for private/helper methods (`_`-prefixed) when the logic is not obvious. Simple private methods (e.g. a `_compute_xxx` that just assigns a clear expression) may be skipped — avoid docstrings that merely repeat the method name.
- When a method has non-obvious behavior, overrides, or **bypasses the ORM**, a docstring explaining why is **mandatory** (see [Don't bypass the ORM](#dont-bypass-the-orm)).
- Write in English for consistency with the Odoo codebase.
- **The docstring format must pass flake8** — specifically the **`flake8-docstrings`** plugin (checking against **PEP 257** / `pydocstyle`). Key rules to follow:
  - Use `"""..."""` (triple double-quotes) — `D300`.
  - Start with a concise **summary line ending with a period** — `D400`, written in the imperative mood ("Confirm...", "Return...") — `D401`.
  - The opening `"""` sits **directly on** the summary line (no blank line above) — `D210`/`D212`.
  - If there's a body: leave **one blank line** between the summary line and the rest of the description — `D205`.
  - No surrounding whitespace — `D210`.
- Configure `flake8-docstrings` in CI and pick a `docstring-convention` (e.g. `pep257`) in `setup.cfg`/`.flake8` so the whole team checks it automatically.

```python
def action_confirm(self):
    """Confirm the order, reserve stock and notify the customer.

    Raise UserError if any line has no available quantity.
    """
    self.ensure_one()
    ...
```

### Other conventions

- `UpperCamelCase` for class names (`class AccountMove`).
- `snake_case` (lowercase, underscores) for variable names.
- Variables that are records/recordsets must **not** get `_id`/`_ids`.
- When iterating a recordset, name the variable `record` (or `rec`) if it's an instance of the current model; otherwise use a different name.
- Use `%(varname)s` (named) instead of positional `%s` for readability and translation.
- Don't use the `_compute`/`compute` prefix for methods that aren't computing a field.
- Single quotes `'...'` for plain strings and dict/tuple/list keys. Double quotes `"..."` for any string **shown to a user** — the argument of `_()` (or `self.env._()`), messages raised in `UserError` / `ValidationError` / etc., and a field's `string` / `help`. Example: `raise ValidationError(_("Login failed or no cookies returned"))`.
- Use `"""..."""` for docstrings.

---

## 8. JavaScript & CSS

- **Don't** commit **minified** JavaScript libraries into the source.
- `UpperCamelCase` for JS class declarations.
- Limit JS unless truly necessary.
- **CSS**: don't add CSS if Bootstrap/Odoo utility classes already solve it.

---

## 9. Security

- **`ir.model.access.csv`**: defines access rights (CRUD) on models.
- **`security.xml`**:
  - Declare `groups` in a dedicated `<data>` tag, placed **at the top**.
  - Declare `record rules` in a separate `<data>` tag.
  - Rules for the **same model must be contiguous**, not interleaved with rules of other models.
- Always review access rights before merging: avoid leaving a new model without an access rule or granting overly broad permissions.

---

## 10. Automation tests

- Write tests against the **intended business scenario**, not tests that "follow the current code".
- Use a clear example domain for emails in tests (e.g. `@example.com`) to avoid touching real data.
- **Reuse demo data** instead of creating new data when possible, to improve CI performance.
- When a bug fix/improvement **changes computation logic**, you must fix or add the corresponding test cases. If impossible, clearly state why for the reviewer.
- When modifying tests of a stable version, a clear in-code comment explaining why is mandatory.

---

## 11. External dependencies

### Declare in the manifest

```python
{
    'external_dependencies': {
        'python': ['external_dependency_python_1', 'external_dependency_python_2'],
        'bin': ['external_dependency_binary_1'],
    },
}
```

### try/except on import

```python
try:
    import external_dependency_python_1
    BIN_PATH = tools.find_in_path('external_dependency_binary_1')
except (ImportError, IOError) as err:
    _logger.debug(err)
```

### requirements.txt

- Add the library to the repository's `requirements.txt` (create it if missing).
- Notify the infrastructure/DevOps team to install the library on the server, and **confirm it's fully installed** before merging.

---

## 12. Migrations & Hooks

### Migrations

- When you change the **database structure** or affect **existing data**, you must write a migration script and bump the module's `version`.
- Split migration logic into **small functions**, called from `migrate(cr, version)`.

### Installation hooks

- When writing a hook, split features into **small functions** called from the hook function.
- **Uninstall hook**: if installing a module alters data of a module it depends on (e.g. modifying an attribute of a window action), it must have an uninstall hook to **restore the original state**.

---

## 13. UX & UI

- **Place related fields next to each other** so users enter data fluidly. Avoid: entering Address, then jumping to Tax ID, Email, and only then back to Province/City.
- **Limit nested popup forms**: no more than 3 levels. Many nested popups create a poor data-entry experience.

---

## 14. i18n

- When upgrading to a new version, **re-export the translation files** (`.pot`/`.po`).
- `Creation-Date` and `Revision-Date` only change when **moving to a new version**. Subsequent IMP/FIX commits must **not** change these two — to reduce conflicts during forward-porting.

---

## 15. Commit message

### Language & content

- Commit messages are written entirely in **English**.
- The title contains the **module name** (use commas for multiple modules; too many means splitting the commit).
- Reference an issue if any; use `close #xxx` to auto-close an issue when needed.
- Content should be **clear, short, and concise**.

### Commit prefixes

| Prefix | Meaning |
|--------|---------|
| `[IMP]` | Improvements |
| `[FIX]` | Bug fix |
| `[ADD]` | New feature / new module |
| `[REM]` | Remove a module/feature |
| `[REN]` | Rename a module |
| `[MIG]` | Migrate to a higher Odoo version |
| `[UPG]` | Upgrade a module to a later version |
| `[I18N]` | Translation-related matters |
| `[MERGE]` | Merge commits from another branch |
| `[MISC]` | Other matters |

> When addressing review comments on a complex PR, create a **new commit** rather than amending, so reviewers can easily inspect the changes.

---

## 16. Pull request

- The PR prefix is like a commit's, **with the version added** after the prefix, e.g. `[UPG] [<odoo_version>] <module_name>`.
- Use the `[WIP]` prefix while work is in progress.
- Configure the **correct Git name & email** before committing.
- A PR must have a **clear description** or link to a detailed one.
- Don't delete the system-generated PR description template. If there's a checklist, the author must **complete it** before requesting review.
- When a PR **depends on** other PRs, clearly link to them in the description and add the appropriate label.
- When attaching a demo video, **upload it directly** to the platform (GitHub/GitLab) rather than personal storage that can disappear.
- Let CI set statuses automatically (running/failed/passed...) — **don't set them manually**.
- A PR marked **failed** by CI should be addressed promptly (within ~1 working day) or escalated to the maintainer if you can't resolve it.

---

## 17. Branch name

| Purpose | Format |
|---------|--------|
| Bug fix for a module | `v<odoo_version>_fix_<module_name>` |
| Version upgrade | `v<odoo_version>_upg_<module_name>` |
| New module | `v<odoo_version>_add_<module_name>` |
| Remove a module | `v<odoo_version>_rem_<module_name>` |
| Improve a module | `v<odoo_version>_imp_<module_name>` |
| A feature set | `v<odoo_version>_<feature_name>` |

---

## 18. Stable policy

Stable versions are released branches like `16.0`, `17.0`, `18.0`... On these branches:

**Not allowed:**
- Changing the architecture, data model, or database structure (high risk to stability).
- Changing the UI layout / editing views (users are used to the old interface).
- Changing code format/style.
- Renaming methods (breaks dependent products).
- Changing existing xml_ids or deleting existing data records.
- Adding a **required argument** to a function/method (may break dependent modules).

**Allowed:**
- Adding virtual fields (`store=False`, not in the DB) if needed.
- Changing Python code if it **does not affect** the DB structure.
- Editing XML/CSV content if it doesn't affect the DB structure and doesn't change the view layout.
- When a logic change affects data: write a **migration within the module** so data follows the new logic.

**Critical cases** requiring architecture/UI changes on a stable version: add an auto-install **`patch` module** so the running system isn't affected. All other large changes should go to the **master/dev** branch for a future version.

---

## 19. Other conventions

- **Test before pushing.** Avoid "blind coding" and pushing without running it — at least clear basic errors.
- When picking up a task/issue, **challenge and sanity-check** it before coding, rather than following the description mechanically.
- Bug fixes / improvements that **change computation logic** must update/add tests (see [section 10](#10-automation-tests)).
- Don't edit code directly in the Odoo core fork (see [section 2](#2-source-control)).

---

> This document is a general framework. Append your team's **own conventions** (CI/CD, review checklist, internal naming...) at the end as needed.
