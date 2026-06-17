# Odoo Technical Rules (Bộ quy tắc kỹ thuật chung)

> 🌐 Ngôn ngữ: **Tiếng Việt** · [English](technical-rules.en.md)
>
> Bộ quy tắc kỹ thuật chung cho việc phát triển module Odoo. Tài liệu này **không gắn với một công ty cụ thể** — bạn có thể fork và tùy chỉnh cho team/dự án của mình.
>
> **Quy ước về placeholder trong tài liệu:**
> - `<prefix>` — tiền tố module của team bạn (ví dụ `acme_`). Hãy thay bằng tiền tố thực tế.
> - `<odoo_version>` — phiên bản Odoo (ví dụ `17.0`).
> - `<module_name>`, `<model_name>` — tên kỹ thuật của module/model tương ứng.

## Mục lục

1. [Môi trường phát triển](#1-môi-trường-phát-triển)
2. [Quản lý mã nguồn](#2-quản-lý-mã-nguồn)
3. [Module](#3-module)
4. [Cấu trúc thư mục & file](#4-cấu-trúc-thư-mục--file)
5. [Models & Fields](#5-models--fields)
6. [XML / Views / Data](#6-xml--views--data)
7. [Python](#7-python)
8. [JavaScript & CSS](#8-javascript--css)
9. [Bảo mật (Security)](#9-bảo-mật-security)
10. [Automation Test](#10-automation-test)
11. [External Dependencies](#11-external-dependencies)
12. [Migrations & Hooks](#12-migrations--hooks)
13. [UX & UI](#13-ux--ui)
14. [i18n (Đa ngôn ngữ)](#14-i18n-đa-ngôn-ngữ)
15. [Commit Message](#15-commit-message)
16. [Pull Request](#16-pull-request)
17. [Branch Name](#17-branch-name)
18. [Stable Policy (Chính sách ổn định)](#18-stable-policy-chính-sách-ổn-định)
19. [Quy ước khác](#19-quy-ước-khác)

---

## 1. Môi trường phát triển

### Python & PostgreSQL

- Dùng **đúng phiên bản Python và PostgreSQL** mà phiên bản Odoo đang phát triển yêu cầu (tham khảo tài liệu chính thức của Odoo cho từng phiên bản).
- Mỗi phiên bản Odoo nên có một **Python virtual environment riêng** (`venv`) để tránh xung đột thư viện.
- Cài dependencies từ `requirements.txt` của Odoo và của repository hiện hành.

### Công cụ

- **IDE tùy chọn** — không bắt buộc. Khuyến nghị cấu hình linter/formatter chung cho cả team để code thống nhất:
  - Python: `flake8` / `pylint-odoo`, `black` (nếu team thống nhất).
  - XML/JS: `prettier` hoặc tương đương.
- Cấu hình `EditorConfig` ở root repo để đồng nhất indent, charset, line-ending giữa các thành viên.

---

## 2. Quản lý mã nguồn

### Tổ chức repository

- Mỗi phiên bản của một repository tương ứng với **một branch** (ví dụ `17.0`, `18.0`).
- Khai báo đầy đủ các repository phụ thuộc (Odoo core, OCA, theme, các addons dùng chung...) đúng theo branch của phiên bản đang phát triển.
- Tổ chức thư mục local nhất quán trong team, ví dụ: `~/git/<repo_name>/<repo_name><version>`.

### Nguyên tắc

- **Không sửa trực tiếp** vào bản fork của Odoo core (trừ fix/cập nhật file dịch, hoặc khi có chỉ định của người phụ trách). Mọi thay đổi hành vi nên đặt trong addon riêng.

---

## 3. Module

### Tên kỹ thuật

- Tên kỹ thuật module viết **thường, không dấu, ngăn cách bằng `_`**, chỉ dùng ký tự `[a-z0-9_]`.
- Dùng một **tiền tố thống nhất** cho mọi module của team, ví dụ `<prefix>_`. Quy ước này giúp tránh trùng tên với module của Odoo/OCA và dễ nhận diện.
- Khi **kế thừa/mở rộng** một module khác, đặt tên dạng `<prefix>_<base_module>_<feature>`. Ví dụ mở rộng `hr_expense` → `<prefix>_hr_expense_xxx`.
- Module **bản địa hóa** dùng tiền tố chuẩn của Odoo: `l10n_<country_code>_<prefix>_xxx`. Ví dụ: `l10n_vn_<prefix>_accounting`.

### Manifest (`__manifest__.py`)

Manifest mô tả giá trị của module và là cơ sở để người dùng quyết định cài đặt. Các key quan trọng:

| Key | Quy tắc |
|-----|---------|
| `name` | Tên hiển thị (tiếng Anh), ngắn gọn, dễ hiểu, gần gũi với người dùng. |
| `summary` | Mô tả ngắn nêu bật **giá trị** module mang lại (không phải liệt kê tính năng kỹ thuật). Nếu dùng làm meta title nên giữ **≤ 158 ký tự**. |
| `description` | Mô tả chi tiết theo cú pháp **Markdown**: module làm gì? vì sao dùng? khi nào dùng? ai dùng? Tránh thuật ngữ quá kỹ thuật. |
| `author` | Tên tác giả/tổ chức. |
| `website` | URL trang sản phẩm/tài liệu của module. |
| `category` | Đúng category nghiệp vụ. |
| `version` | Module mới bắt đầu từ `<odoo_version>.1.0.0`. Chỉ tăng version khi có **migration**. Không đổi version nếu không viết migration. |
| `depends` | Chỉ depend vào module **thực sự dùng** code/tính năng của nó. Không depend chỉ để "mượn" một menu. |
| `installable` | Mặc định `True`; đặt `False` nếu module chưa sẵn sàng. |
| `license` | Khai báo license rõ ràng (`LGPL-3`, `OPL-1`, ...). |
| `application` | `True` nếu là app, ngược lại `False` (mặc định). |
| `auto_install` | `True` cho module dạng **cầu nối (bridge)** giữa các module khác; ngược lại `False`. |
| `external_dependencies` | Bắt buộc khai báo nếu dùng thư viện Python/binary ngoài (xem [mục 11](#11-external-dependencies)). |
| `images` | Ảnh đại diện trong `static/description/`, ví dụ `['static/description/main_screenshot.png']`. |

> **Lưu ý phiên bản:** giữ `version` ổn định trong cùng một dòng phát hành; chỉ tăng khi thật sự có migration script đi kèm.

### Đổi tên module

- **Tuyệt đối không** đổi tên kỹ thuật module sau khi đã set `installable: True` và phát hành.
- Nếu bắt buộc đổi tên, chỉ thực hiện ở phiên bản nâng cấp sau và khai báo key **`old_technical_name`** (giá trị là tên kỹ thuật cũ) trong manifest để hỗ trợ migration/rename.

---

## 4. Cấu trúc thư mục & file

### Cấu trúc thư mục chuẩn

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
|       |   `-- <component_name>/        # đóng gói theo component
|       |       |-- <component_name>.js
|       |       |-- <component_name>.xml
|       |       `-- <component_name>.scss
|       |-- scss/                        # style chung toàn module (không thuộc component nào)
|       `-- js/                          # logic chung, service, util... (không thuộc component nào)
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

### Tên file

- Chỉ dùng ký tự **`[a-z0-9_]`**.
- **Tách file theo model**: mỗi model một file Python, một file views, một file data...
  - `models/<model_name>.py`
  - `views/<model_name>_views.xml`
  - `data/<model_name>_data.xml`
  - `demo/<model_name>_demo.xml`
  - `templates/<model_name>_templates.xml`
- **Ngoại lệ One2many**: view của dòng con (ví dụ `sale.order.line`) có thể viết chung file view với model cha (`sale.order`), nhưng file Python vẫn phải **tách riêng**.
- **Controller**: nếu chỉ một file thì đặt tên `main.py`; nhiều hơn thì chia theo chức năng.
- **Static — đóng gói theo component, không tách theo loại file.** Một component OWL gồm nhiều file (js + xml + scss) thì gom chung vào **một thư mục `<component_name>/`** thay vì rải mỗi loại file vào một thư mục `js/`, `xml/`, `scss/` riêng. Tách theo loại file khiến các phần của cùng một component nằm xa nhau, rất khó quản lý và bảo trì.

  ```text
  # NÊN — mọi thứ của một component nằm cạnh nhau
  static/src/components/task_card/
  |-- task_card.js
  |-- task_card.xml
  `-- task_card.scss

  # TRÁNH — tách rời theo loại file
  static/src/js/task_card.js
  static/src/xml/task_card.xml
  static/src/scss/task_card.scss
  ```

  - Các file của một component đặt cùng tên với component (`<component_name>.js`, `<component_name>.xml`, `<component_name>.scss`).
  - Chỉ giữ `src/scss/` và `src/js/` ở cấp ngoài cho **style/logic dùng chung toàn module** (không thuộc component cụ thể nào), ví dụ biến SCSS chung, service, util.
  - Trong `__manifest__.py`, có thể khai báo asset bằng glob để gom cả thư mục component, ví dụ `'<module_name>/static/src/components/**/*'`.

---

## 5. Models & Fields

### Tên model

- Viết thường, ngăn cách bằng dấu chấm: `account.move`.
- Dùng **số ít**: `account.invoice` thay vì `account.invoices`.

### Description

- Mọi model **mới tạo** bắt buộc có thuộc tính **`_description`**.

### Tên trường (field)

- Trường `Many2one` kết thúc bằng **`_id`**.
- Trường `One2many` / `Many2many` kết thúc bằng **`_ids`**.

### Thuộc tính trường

- **`string`**: bắt buộc cho mọi trường. Ngắn gọn, hạn chế hiển thị ≥ 2 dòng trên view.
- **`help`**: bắt buộc cho mọi trường mà ý nghĩa **không hiển nhiên** từ `string` (trường tính toán, trường có ràng buộc nghiệp vụ, trường ảnh hưởng tới hành vi khác...). Help nên cho biết: trường này nghĩa là gì? khi nào dùng? tại sao dùng? có cảnh báo gì không? Chỉ được bỏ `help` khi `string` đã tự giải thích trọn vẹn (ví dụ `name`, `active`).
- **`related`**: khi đã `related` thì không khai báo lại các thuộc tính khác trừ khi muốn override hoặc bổ sung. Nếu related tới một trường `required` thì phải có `store=False` hoặc `readonly=False`.

---

## 6. XML / Views / Data

### Bộ view tối thiểu

Khi thiết kế view cho một model có giao diện cho người dùng cuối, **tối thiểu phải có 4 view cơ bản**:

| View | Mục đích |
|------|----------|
| `list` (tree) | Xem nhiều record, là view mặc định của hầu hết action. |
| `kanban` | **Bắt buộc** — đảm bảo trải nghiệm trên **mobile**, nơi list view hiển thị kém. |
| `form` | Xem/nhập chi tiết một record. |
| `search` | Cung cấp filter và group-by (xem [Filter & Group](#filter--group)). |

- Action chính của model nên khai báo đủ các mode tương ứng, ví dụ `view_mode="list,kanban,form"` và gắn `search_view_id`.
- Ngoại lệ: model phụ trợ (model kỹ thuật, wizard, dòng con One2many không truy cập trực tiếp...) không bắt buộc đủ 4 view — chỉ cần view thực sự được dùng.

### Quy ước record

- Thuộc tính `id` đặt **trước** `model`.
- Với `<field>`, thuộc tính `name` đặt **đầu tiên**, rồi mới đến `widget`, `options`,...
- Tham chiếu xml_id **trong cùng module** thì không cần ghi tiền tố `module_name.` (chỉ ghi khi tham chiếu sang module khác).
- Demo record nên có hậu tố để phân biệt với record thường (ví dụ `..._demo`).

### xml_id — quy ước đặt tên

| Loại | Format | Ví dụ |
|------|--------|-------|
| Data record | `<model_name>_<record_name>` | `res_users_important_person` |
| View | `<model_name>_view_<view_type>` | `sale_order_view_form` |
| Action chính | `<model_name>_action` | `sale_order_action` |
| Action phụ | `<model_name>_action_<xxx>` | `sale_order_action_draft` |
| Group | `<module_name>_group_<group_name>` | `<prefix>_sale_group_manager` |
| Record rule | `<model_name>_rule_<concerned_group>` | `sale_order_rule_company` |

### Inherited XML (kế thừa view)

- Trong **một module**, chỉ mở rộng một view **một lần**. Cần thêm nhiều trường thì gom vào **một** inherit view, không tạo nhiều view nhỏ.
- xml_id của view kế thừa nên **dùng lại ID của view gốc** để dễ truy vết các view kế thừa.
- **Hạn chế tối đa `position="replace"`** — dễ gây lỗi `Element ... cannot be located in parent view` cho các module/view khác. Nếu bắt buộc dùng:
  - Comment giải thích rõ lý do.
  - Đặt `priority` cao (> 100) để giảm rủi ro xung đột.

```xml
<record id="sale_order_view_form" model="ir.ui.view">
    <field name="name">sale.order.view.form.inherit</field>
    <field name="model">sale.order</field>
    <field name="priority">110</field> <!-- Priority > 100 -->
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <!-- Phải replace vì ... -->
        <xpath expr="//field[@name='my_field_1']" position="replace"/>
    </field>
</record>
```

### QWeb

- Không dùng `t-x-options` (như `t-field-options`) đã bị loại bỏ từ các phiên bản Odoo gần đây — dùng cú pháp hiện hành theo phiên bản.

### Menu

- Menu root không gắn action nên để trong file riêng (ví dụ `root_menu.xml`).
- Menu gắn với model nào thì đặt trong file view của model đó.
- App menu bắt buộc có **`web_icon`**.

### Filter & Group

- Tên filter dùng tiền tố **`ftr_`**, tên group-by dùng tiền tố **`grp_`** (quy ước tùy chọn nhưng nên thống nhất trong team).
- Khi thiết kế view, luôn nghĩ đến filter và group-by hợp lý. Ví dụ model có `department_id` thì nên có group by Department; có `state` thì nên có filter theo state.

---

## 7. Python

### Thứ tự import

```python
# 1: thư viện chuẩn của Python
import base64
import logging
import re

# 2: thư viện bên thứ 3 chắc chắn có
import lxml

# 3: import của Odoo
import odoo
from odoo import api, fields, models  # sắp xếp theo alphabet
from odoo.tools.safe_eval import safe_eval
from odoo.tools.translate import _

# 4: import từ các module Odoo khác
from odoo.addons.web.controllers.main import Home

# 5: local import
from . import utils

# 6: thư viện bên thứ 3 không chắc có
_logger = logging.getLogger(__name__)
try:
    import external_dependency_python_N
except ImportError:
    _logger.debug('Cannot `import external_dependency_python_N`.')
```

### Thứ tự khai báo trong model

1. Private attributes: `_name`, `_description`, `_inherit`.
2. Default methods: `_default_<field_name>`.
3. Khai báo Fields.
4. `_sql_constraints`.
5. `_default_get`.
6. Compute & search methods.
7. Constraints & onchange.
8. CRUD methods (ORM overrides).
9. Action methods.
10. Business methods khác.

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

    # Compute / search (cùng thứ tự với khai báo field)
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

### Quy ước đặt tên method

| Loại | Format |
|------|--------|
| Compute | `_compute_<field_name>` |
| Inverse | `_inverse_<field_name>` |
| Search | `_search_<field_name>` |
| Default | `_default_<field_name>` |
| Onchange | `_onchange_<field_name>` |
| Constraint | `_check_<constraint_name>` |

### No SQL Injection

**KHÔNG BAO GIỜ** dùng nối chuỗi để chèn biến vào SQL.

```python
# RẤT TỆ — lỗ hổng SQL injection
cr.execute('SELECT ... WHERE parent_id IN (' + ','.join(map(str, ids)) + ')')

# ĐÚNG — dùng tham số hóa
cr.execute('SELECT DISTINCT child_id FROM rel WHERE parent_id IN %s', (tuple(ids),))
```

- **Không dùng `AsIs`** khi chưa xử lý/escape dữ liệu đầu vào.

### Không bypass ORM

- Không truy vấn SQL trực tiếp nếu ORM làm được điều tương tự.

```python
# SAI
cr.execute("SELECT id FROM auction_lots WHERE state=%s AND obj_price>0", ('draft',))

# ĐÚNG
records = self.search([('state', '=', 'draft'), ('obj_price', '>', 0)])
```

- Nếu buộc phải bypass ORM (ví dụ vì performance), phải có **docstring giải thích rõ lý do**.

### Validate dữ liệu

- **Không dùng `onchange` để validate** — onchange chỉ chạy trên view và dữ liệu vẫn lưu được dù không thỏa điều kiện.
- Dùng **`@api.constrains`** để validate; onchange chỉ nên dùng để **warning** hoặc gợi ý giá trị.

### Docstring

- **Bắt buộc** cho mọi method **public** (action, business method, API dùng cho module khác, override ORM như `create`/`write`/`unlink`). Docstring nên nêu: method làm gì, tham số chính, giá trị trả về, và side-effect đáng chú ý nếu có.
- **Khuyến khích** cho method private/helper (`_`-prefixed) khi logic không hiển nhiên. Method private đơn giản (ví dụ `_compute_xxx` chỉ gán một biểu thức rõ ràng) thì có thể bỏ qua — tránh docstring chỉ lặp lại tên hàm.
- Khi method có hành vi không hiển nhiên, override hoặc **bypass ORM**, docstring giải thích lý do là **bắt buộc** (xem [Không bypass ORM](#không-bypass-orm)).
- Viết bằng tiếng Anh để đồng nhất với codebase Odoo.
- **Format docstring phải pass flake8** — cụ thể là plugin **`flake8-docstrings`** (kiểm theo chuẩn **PEP 257** / `pydocstyle`). Các quy tắc chính phải tuân thủ:
  - Dùng `"""..."""` (nháy kép, ba dấu) — `D300`.
  - Bắt đầu bằng **một dòng tóm tắt (summary line)** ngắn gọn, **kết thúc bằng dấu chấm** — `D400`, viết ở thể mệnh lệnh ("Confirm...", "Return...") — `D401`.
  - Dòng `"""` mở **liền ngay** với dòng tóm tắt (không có dòng trống phía trên) — `D210`/`D212`.
  - Nếu có nội dung chi tiết: để **một dòng trống** ngăn cách dòng tóm tắt với phần mô tả còn lại — `D205`.
  - Không có khoảng trắng thừa ở đầu/cuối — `D210`.
- Cấu hình `flake8-docstrings` trong CI và chọn `docstring-convention` (ví dụ `pep257`) trong `setup.cfg`/`.flake8` để cả team kiểm tự động.

```python
def action_confirm(self):
    """Confirm the order, reserve stock and notify the customer.

    Raise UserError if any line has no available quantity.
    """
    self.ensure_one()
    ...
```

### Quy ước khác

- `UpperCamelCase` cho tên class (`class AccountMove`).
- `snake_case` (thường, gạch dưới) cho tên biến.
- Biến là record/recordset thì **không** thêm `_id`/`_ids`.
- Khi lặp recordset, đặt biến là `record` (hoặc `rec`) nếu là instance của model hiện hành; nếu không thì đặt tên khác.
- Dùng `%(varname)s` (named) thay cho positional `%s` để dễ đọc & dễ dịch.
- Không dùng tiền tố `_compute`/`compute` cho method không phải compute field.
- Nháy đơn `'...'` cho string thường & key của dict/tuple/list. Nháy kép `"..."` cho mọi chuỗi **hiển thị cho người dùng** — đối số của `_()` (hoặc `self.env._()`), message trong `UserError` / `ValidationError` / v.v., và `string` / `help` của field. Ví dụ: `raise ValidationError(_("Login failed or no cookies returned"))`.
- Docstring dùng `"""..."""`.

---

## 8. JavaScript & CSS

- **Không** commit thư viện JavaScript đã **minified** vào source.
- `UpperCamelCase` cho khai báo class JS.
- Hạn chế viết JS nếu không thực sự cần.
- **CSS**: không viết thêm CSS nếu Bootstrap/utility class của Odoo đã giải quyết được.

---

## 9. Bảo mật (Security)

- **`ir.model.access.csv`**: định nghĩa quyền truy cập (CRUD) trên các model.
- **`security.xml`**:
  - Khai báo `groups` trong một thẻ `<data>` riêng, đặt **trên cùng**.
  - Khai báo `record rules` trong một thẻ `<data>` khác.
  - Các rule của **cùng một model phải nằm liên tiếp**, không xen lẫn rule của model khác.
- Luôn rà soát quyền truy cập trước khi merge: tránh để model mới không có access rule hoặc cấp quyền quá rộng.

---

## 10. Automation Test

- Viết test theo **kịch bản nghiệp vụ mong muốn**, không viết test "chạy theo code hiện có".
- Email trong test nên dùng domain ví dụ rõ ràng (ví dụ `@example.com`) để tránh đụng dữ liệu thật.
- **Tái sử dụng demo data** thay vì tạo data mới khi có thể, để tăng performance khi chạy CI.
- Khi fix bug/cải tiến làm **thay đổi logic tính toán**, phải sửa hoặc bổ sung test case tương ứng. Nếu không thể, nêu rõ lý do cho người review.
- Khi sửa test của một phiên bản ổn định, bắt buộc comment giải thích rõ trong code.

---

## 11. External Dependencies

### Khai báo trong manifest

```python
{
    'external_dependencies': {
        'python': ['external_dependency_python_1', 'external_dependency_python_2'],
        'bin': ['external_dependency_binary_1'],
    },
}
```

### Bắt try/except khi import

```python
try:
    import external_dependency_python_1
    BIN_PATH = tools.find_in_path('external_dependency_binary_1')
except (ImportError, IOError) as err:
    _logger.debug(err)
```

### requirements.txt

- Bổ sung thư viện vào `requirements.txt` của repository (tạo mới nếu chưa có).
- Thông báo cho bộ phận hạ tầng/DevOps để cài thư viện lên server, và **confirm đã cài đủ** trước khi merge.

---

## 12. Migrations & Hooks

### Migrations

- Khi thay đổi **cấu trúc database** hoặc ảnh hưởng đến **dữ liệu đang có**, phải viết migration script và tăng `version` module.
- Tách logic migration thành các **hàm nhỏ**, gọi trong `migrate(cr, version)`.

### Installation hooks

- Khi viết hook, tách tính năng thành các **hàm nhỏ** và gọi trong hàm hook.
- **Uninstall hook**: nếu module khi cài làm thay đổi data của module nó depend (ví dụ sửa thuộc tính một window action), phải có uninstall hook để **trả lại trạng thái ban đầu**.

---

## 13. UX & UI

- **Nhóm trường liên quan đặt cạnh nhau** để người dùng nhập liệu liền mạch. Tránh: đang nhập Địa chỉ lại nhảy sang Mã số thuế, Email rồi mới quay lại Tỉnh/Thành.
- **Giới hạn popup form lồng nhau**: không vượt quá 3 cấp. Nhiều popup lồng nhau gây trải nghiệm nhập liệu tồi.

---

## 14. i18n (Đa ngôn ngữ)

- Khi nâng lên phiên bản mới, **xuất lại file dịch** (`.pot`/`.po`).
- `Creation-Date` và `Revision-Date` chỉ thay đổi khi **lên phiên bản mới**. Các commit IMP/FIX sau đó **không đổi** hai mốc này — để giảm conflict khi forward-port.

---

## 15. Commit Message

### Ngôn ngữ & nội dung

- Commit message viết hoàn toàn bằng **tiếng Anh**.
- Tiêu đề chứa **tên module** (dùng dấu phẩy nếu nhiều module; quá nhiều thì tách commit).
- Tham chiếu issue nếu có; dùng `close #xxx` để tự đóng issue khi cần.
- Nội dung **rõ ràng, ngắn gọn, xúc tích**.

### Tiền tố commit

| Tiền tố | Ý nghĩa |
|---------|---------|
| `[IMP]` | Cải tiến (improvements) |
| `[FIX]` | Sửa lỗi |
| `[ADD]` | Thêm tính năng / module mới |
| `[REM]` | Xóa module/tính năng |
| `[REN]` | Đổi tên module |
| `[MIG]` | Migrate lên phiên bản Odoo cao hơn |
| `[UPG]` | Nâng cấp module lên phiên bản sau |
| `[I18N]` | Vấn đề liên quan dịch thuật |
| `[MERGE]` | Trộn commit từ nhánh khác |
| `[MISC]` | Các vấn đề khác |

> Khi xử lý comment review trên một PR phức tạp, nên tạo **commit mới** thay vì amend, để người review dễ kiểm tra thay đổi.

---

## 16. Pull Request

- Tiêu đề PR bắt đầu bằng **phiên bản Odoo, rồi tới tiền tố commit** (hai cặp ngoặc dính liền, không có dấu cách), sau đó là tên module: `[<odoo_version>][<PREFIX>] <module_name>` (ví dụ: `[18.0][IMP] sale_discount`).
- Dùng tiền tố `[WIP]` khi đang làm dở.
- Cấu hình **đúng tên & email Git** trước khi commit.
- PR phải có **mô tả rõ ràng** hoặc link tới mô tả chi tiết.
- Không xóa phần template mô tả PR do hệ thống sinh ra. Nếu có checklist, người tạo PR phải **check đủ** trước khi nhờ review.
- Khi PR **phụ thuộc** PR khác, ghi rõ link tới các PR đó trong mô tả và gắn label phù hợp.
- Khi cần đính kèm video minh họa, **upload trực tiếp** lên hệ thống (GitHub/GitLab) thay vì lưu ở nơi cá nhân dễ mất.
- Để CI tự gắn các trạng thái (running/failed/passed...) — **không gắn thủ công**.
- PR bị CI báo **failed** nên được xử lý sớm (trong ~1 ngày làm việc) hoặc báo người phụ trách nếu không tự xử lý được.

---

## 17. Branch Name

| Mục đích | Format |
|----------|--------|
| Fix bug một module | `v<odoo_version>_fix_<module_name>` |
| Nâng cấp phiên bản | `v<odoo_version>_upg_<module_name>` |
| Thêm module mới | `v<odoo_version>_add_<module_name>` |
| Xóa module | `v<odoo_version>_rem_<module_name>` |
| Cải tiến module | `v<odoo_version>_imp_<module_name>` |
| Một bộ tính năng | `v<odoo_version>_<feature_name>` |

---

## 18. Stable Policy (Chính sách ổn định)

Phiên bản ổn định là các bản đã phát hành dạng `16.0`, `17.0`, `18.0`... Trên các bản này:

**Không được:**
- Thay đổi kiến trúc, mô hình dữ liệu, cấu trúc database (rủi ro cao cho tính ổn định).
- Thay đổi bố cục giao diện / sửa view (người dùng đã quen giao diện cũ).
- Thay đổi format/định dạng code.
- Đổi tên method (gây lỗi cho sản phẩm phụ thuộc).
- Đổi xml_id hoặc xóa data record hiện có.
- Thêm **argument bắt buộc** vào function/method (có thể break module phụ thuộc).

**Được phép:**
- Thêm trường ảo (`store=False`, không tồn tại trong DB) nếu cần.
- Thay đổi code Python nếu **không ảnh hưởng** cấu trúc DB.
- Sửa nội dung XML/CSV nếu không ảnh hưởng cấu trúc DB và không đổi bố cục view.
- Khi thay đổi logic ảnh hưởng dữ liệu: viết **migration ngay trong module** để dữ liệu chạy theo logic mới.

**Trường hợp nghiêm trọng** cần thay đổi kiến trúc/giao diện trên bản ổn định: bổ sung một **module `patch`** auto-install để không ảnh hưởng hệ thống đang chạy. Các thay đổi lớn còn lại nên dồn về branch **master/dev** cho phiên bản tương lai.

---

## 19. Quy ước khác

- **Test trước khi push.** Tránh "code chay" rồi push mà chưa chạy thử — ít nhất phải vượt qua các lỗi cơ bản.
- Khi nhận task/issue, **phản biện và kiểm tra tính hợp lý** trước khi code, thay vì làm máy móc theo mô tả.
- Bug fix / cải tiến làm **thay đổi logic tính toán** thì phải cập nhật/bổ sung test (xem [mục 10](#10-automation-test)).
- Không sửa code trực tiếp vào bản fork Odoo core (xem [mục 2](#2-quản-lý-mã-nguồn)).

---

> Tài liệu này là bộ khung chung. Hãy thêm vào phần cuối các quy ước **riêng của team bạn** (CI/CD, review checklist, naming nội bộ...) khi cần.
