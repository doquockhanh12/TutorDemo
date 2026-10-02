# Project documentation history

Historical snapshots from before the 2026-10-02 consolidation. These blocks preserve the original text for review; they are not active instructions. Current guidance lives in root AGENTS.md, README.md, PROJECT_BRIEF.md, DESIGN.md, docs/planning/PRODUCT_SPEC.md, docs/architecture/ARCHITECTURE.md, docs/screens/SCREEN_INVENTORY.md, and docs/design/FIGMA_ANALYSIS.md.

## AGENTS.md

~~~~markdown
# AGENTS.md – Quy tắc cho Codex / coding agent

## Phạm vi hiện tại

TutorNearMe hiện là FRONTEND-ONLY interactive prototype.

Ở giai đoạn hiện tại:

- dùng mock data và local frontend state;
- tập trung vào UI, navigation, responsive và interaction;
- không thiết kế hoặc implement database;
- không implement backend/API thật;
- không thiết kế ORM, migrations hoặc transaction logic;
- không tự mở rộng project thành full-stack nếu chưa được yêu cầu.

Các trạng thái nghiệp vụ hiện tại chỉ phục vụ việc mô phỏng UI,
không được tự coi là backend business rules cuối cùng.


## Trước khi code

Luôn đọc theo thứ tự:

1. `PROJECT_BRIEF.md`
2. `DESIGN.md`
3. `DESIGN_SOURCE_OF_TRUTH.md` và reference tương ứng trong `reference/final/`
4. `docs/design/FIGMA_ANALYSIS.md`
5. `docs/planning/MVP_SCOPE.md`
6. `docs/screens/SCREEN_INVENTORY.md`
7. Flow tương ứng trong `docs/flows/`
8. `DESIGN.md` của role đang làm trong `apps/web/src/features/<role>/`

Nếu các tài liệu có mâu thuẫn, không tự đoán.
Hãy báo rõ conflict trước khi implementation.


## Source of truth cho UI

Sử dụng nguồn theo thứ tự ưu tiên:

1. Yêu cầu mới nhất của user.
2. `AGENTS.md`
3. `reference/final/homepage/`, `reference/final/learner/`, `reference/final/tutor/` cho appearance của các trang tương ứng.
4. `DESIGN_SOURCE_OF_TRUTH.md` và `DESIGN.md` hiện hành.
5. `docs/design/FIGMA_ANALYSIS.md` cho cấu trúc Figma đã xác nhận.
6. `docs/screens/SCREEN_INVENTORY.md` và role flow trong `docs/flows/`.
7. Các tài liệu planning/reference khác.

Editorial Utility xanh rêu trong `docs/design/VISUAL_DIRECTION.md` là tài liệu lịch sử **DEPRECATED**. Finalized reference quy định hệ visual xanh/đỏ/vàng/cyan/violet/kem, Nunito/Nunito Sans. Không dùng lại xanh rêu làm brand. Green ngữ nghĩa cho success/verified/available vẫn hợp lệ.

`docs/design/FIGMA_ANALYSIS.md` là nguồn lưu trữ lâu dài
cho những gì đã đọc được từ Figma MCP và Figma exports.

Không phụ thuộc vào session memory để nhớ Figma.


## Quy tắc kiến trúc frontend

- Không implement cả 3 role trong một giant component.
- Tách role theo `learner`, `tutor`, `admin` nhưng chia sẻ primitives chung.
- Không duplicate Button/Input/Modal/Table/Badge giữa role folders.
- UI component không hard-code dữ liệu demo nếu có thể truyền bằng props.
- Mock data nên được tách khỏi presentation component khi hợp lý.
- Shared component chỉ nên chứa behavior/design thực sự dùng chung giữa các role.
- Không ép Learner, Tutor và Admin sử dụng cùng một app shell nếu UX của chúng khác nhau.


## Quy tắc Figma

- Figma là nguồn tham chiếu chính về bố cục, hierarchy, information grouping
  và navigation pattern.
- `docs/design/FIGMA_ANALYSIS.md` lưu lại những findings đã được xác nhận.
- Không gọi lại Figma MCP trừ khi user yêu cầu hoặc thực sự cần thông tin chưa có.
- Không chuyển x/y tuyệt đối thành CSS absolute một cách máy móc.
- Dùng Flexbox/Grid/containers/responsive layout.
- Không coi exact pixel dimensions trong Figma là responsive specification.
- Bảng màu Figma hiện tại không phải final.
- Typography hiện tại không bắt buộc giữ nếu design direction mới tốt hơn.
- Placeholder icon, emoji, glyph và decoration trong Figma không phải final.
- Không được suy rộng thông tin từ một role sang role khác nếu chưa có evidence.
- Nội dung được đánh dấu `UNKNOWN` phải tiếp tục là UNKNOWN cho đến khi có nguồn xác nhận.

Ưu tiên giữ từ Figma:

- layout structure;
- information hierarchy;
- section arrangement;
- navigation pattern;
- data grouping;
- useful interaction patterns.

Được phép redesign:

- palette;
- typography;
- icon system;
- shadows;
- radius;
- border treatment;
- exact spacing;
- decorative styling;
- responsive adaptation;
- hover/focus/motion states.


## Quy tắc theo role

### Learner / Parent

Ưu tiên:

- approachable;
- discovery-oriented;
- dễ tìm và so sánh gia sư;
- bố cục thoáng hơn;
- trust và clarity.

Learner sử dụng consumer/public navigation pattern,
không ép sang dashboard sidebar nếu không cần thiết.


### Tutor

Ưu tiên:

- professional;
- task-oriented;
- schedule-driven;
- dễ xử lý request, lịch và học viên;
- information density vừa phải.

Tutor workspace sử dụng sidebar pattern. Trang public `/tutor` là landing tuyển gia sư theo `reference/final/tutor/`, không dùng workspace shell.


### Admin

Ưu tiên:

- information-dense;
- scan nhanh;
- table/filter/status rõ;
- action dễ tìm;
- decoration tối thiểu.

Admin sử dụng operational dashboard/sidebar pattern.


## Quy tắc làm từng luồng

Chỉ chỉnh role được yêu cầu trừ khi cần thay đổi shared design system.

Nếu shared component thay đổi, phải kiểm tra ảnh hưởng tới cả 3 role.

Khi tạo màn hình chưa có trong Figma:

- dùng role shell hiện có;
- dùng screen inventory và flow để xác định chức năng;
- dùng pattern gần nhất trong `FIGMA_ANALYSIS.md`;
- không tự thêm chức năng ngoài scope chỉ để làm màn hình đầy hơn.


## Visual quality

Không mặc định tạo giao diện kiểu generic AI/SaaS.

Tránh:

- purple/blue gradient SaaS mặc định;
- glassmorphism không cần thiết;
- mọi section đều nằm trong card;
- excessive rounded cards;
- excessive shadows;
- oversized hero text ở dashboard;
- random gradient;
- icon không đồng nhất;
- component-library default styling không chỉnh sửa.

Ưu tiên:

- distinctive;
- modern;
- trustworthy;
- educational nhưng không trẻ con;
- accessible;
- coherent visual hierarchy;
- deliberate spacing;
- một icon family thống nhất.


## Responsive

Figma hiện tại chủ yếu là desktop reference.

Không scale nguyên desktop xuống mobile.

Phải thiết kế lại layout phù hợp:

- desktop;
- tablet;
- mobile.

Các table/calendar/filter/sidebar phải có responsive strategy riêng.


## Verification

Trước khi kết thúc một batch UI:

- chạy app;
- kiểm tra responsive;
- kiểm tra các viewport chính;
- chụp/đối chiếu giao diện;
- sửa overflow;
- sửa spacing;
- sửa typography;
- sửa icon;
- kiểm tra loading/empty/error states nếu có;
- kiểm tra hover/focus/disabled states;
- kiểm tra accessibility cơ bản;
- không tuyên bố xong khi chưa visual review.


## Khi kết thúc session

Nếu có quyết định thiết kế hoặc thay đổi quan trọng:

- cập nhật tài liệu project tương ứng;
- không chỉ lưu quyết định trong conversation;
- không coi Codex memory/session memory là source of truth;
- ghi UNKNOWN nếu thông tin chưa được xác nhận.
~~~~

## README.md

~~~~markdown
# TutorNearMe – Frontend prototype

TutorNearMe là đồ án website tìm gia sư sinh viên theo khu vực (hyperlocal). Project hiện là **frontend-only interactive prototype**, tách rõ ba luồng giao diện **Người học/Phụ huynh**, **Gia sư**, **Admin** và dùng chung nền tảng thiết kế.

## Nguồn thiết kế hiện hành

- `reference/final/homepage/`, `reference/final/learner/`, `reference/final/tutor/` là nguồn visual cao nhất; ba folder này được giữ nguyên để đối chiếu.
- `DESIGN_SOURCE_OF_TRUTH.md` và `DESIGN.md` mô tả hệ màu sống động và Nunito/Nunito Sans hiện hành. Thiết kế Editorial Utility xanh rêu đã deprecated.
- `docs/design/FIGMA_ANALYSIS.md` giữ findings Figma làm tham chiếu cấu trúc.

## Nguồn đầu vào đã tổng hợp

- Đề tài số 4 trong sheet `2_Goi_y_de_tai`: **TutorNearMe – Gia sư sinh viên hyperlocal**.
- Sơ đồ 3 luồng công việc do nhóm cung cấp.
- Figma hiện tại: dùng chủ yếu làm **tham chiếu bố cục / information architecture**, không khóa màu sắc hiện tại.

## Cách dùng project

1. Đọc `PROJECT_BRIEF.md` và `DESIGN.md` ở thư mục gốc.
2. Đọc `docs/planning/MVP_SCOPE.md` để biết phạm vi bắt buộc.
3. Xem route và hướng dẫn chạy tại `apps/web/README.md`.
4. Các luồng UI nằm trong `apps/web/src/features/public`, `learner`, `tutor`, `admin`; mock data ở `apps/web/src/data`.
5. Thành phần thực sự dùng chung đặt trong `apps/web/src/components`, token tại `apps/web/src/styles/tokens.css`.

## Stack đã chốt

Frontend dùng **React, JavaScript, Vite, React Router, CSS thuần và Lucide Icons**. Dữ liệu hiện là mock/local state; không có backend, database hay API thật.

Ba landing public và các route sản phẩm demo hiện nằm trong `apps/web`. Xem [hướng dẫn chạy app](apps/web/README.md). Ghi chú skeleton full-stack cũ được lưu tại `docs/archive/LEGACY_SCAFFOLD.md`, không phải cấu trúc đang triển khai.

## Nguyên tắc thiết kế quan trọng

- Giữ **bố cục và cách tổ chức thông tin** tốt từ Figma hiện tại.
- Finalized references quyết định bảng màu và typography hiện hành.
- Ba luồng có thể khác về mật độ và cảm giác sử dụng, nhưng phải cùng một brand/design system.
- Không để AI tự phát minh toàn bộ màn hình mà không đọc `docs/screens/SCREEN_INVENTORY.md`.
~~~~

## PROJECT_BRIEF.md

~~~~markdown
# PROJECT BRIEF – TutorNearMe

## 1. Bài toán

Phụ huynh hoặc người học cần tìm **gia sư sinh viên ở gần**, đúng môn, phù hợp lịch rảnh và mức học phí. Sinh viên gia sư tạo hồ sơ, khai báo khu vực có thể dạy, lịch rảnh và mức phí để nhận yêu cầu học.

## 2. Vai trò

1. **Người học / Phụ huynh** – tìm và kết nối gia sư phù hợp.
2. **Gia sư** – tạo hồ sơ, thiết lập thông tin dạy học và nhận yêu cầu.
3. **Quản trị viên** – quản lý và vận hành hệ thống.

## 3. Chức năng bắt buộc từ đề tài

- Hồ sơ gia sư.
- Môn học.
- Khu vực.
- Lịch rảnh.
- Mức phí.
- Tìm kiếm / lọc.
- Gửi yêu cầu học.
- Xác nhận lịch.
- Trạng thái buổi học.
- Đánh giá.

## 4. Dữ liệu chính được nêu trong đề tài

- `User`
- `TutorProfile`
- `Subject`
- `Location`
- `Availability`
- `TutoringRequest`
- `Review`

## 5. Mức độ và hướng công nghệ

- Mức độ: **Trung bình – Khá**.
- Gợi ý cơ bản: HTML/CSS/JavaScript + Bootstrap.
- Có thể mở rộng: Maps API + React/Node.js.

## 6. Mở rộng nếu còn thời gian

- Bản đồ gia sư.
- Chat.
- Gói học.
- Xác minh thẻ sinh viên.
- Matching theo khoảng cách.

## 7. Output môn học yêu cầu

- Requirement.
- Design.
- GitHub repository.
- Slide.
- Demo URL.

> Nguồn: file `IE104_Quan_ly_du_an.xlsm`, sheet `2_Goi_y_de_tai`, đề tài STT 4.
~~~~

## DESIGN.md

~~~~markdown
# TutorNearMe — active design foundation

TutorNearMe hiện là **frontend-only interactive prototype**. Nguồn visual cao nhất là ba bản finalized, giữ nguyên file gốc:

- [`reference/final/homepage/`](reference/final/homepage/) — trang chủ `/`;
- [`reference/final/learner/`](reference/final/learner/) — landing Người học / Phụ huynh `/learner`;
- [`reference/final/tutor/`](reference/final/tutor/) — landing tuyển gia sư `/tutor`, **không phải** tutor dashboard.

Đọc [`DESIGN_SOURCE_OF_TRUTH.md`](DESIGN_SOURCE_OF_TRUTH.md) cho quy tắc visual đầy đủ. Hệ Editorial Utility màu xanh rêu trước đây **DEPRECATED**; bản đặc tả cũ được giữ tại [`docs/design/VISUAL_DIRECTION.md`](docs/design/VISUAL_DIRECTION.md) để tra cứu lịch sử, không dùng làm hướng triển khai mới.

## Nền tảng hiện hành

- Một thương hiệu giáo dục sống động, gần gũi, giàu hình ảnh: xanh đậm/xanh sáng, đỏ/coral, vàng, cyan, violet, kem. Giữ khác biệt màu nhẹ giữa ba reference khi cần đạt visual parity.
- **Nunito** cho heading và **Nunito Sans** cho UI/body là font hiện hành; kiểm tra đầy đủ glyph tiếng Việt. **Lucide** là icon family dùng trong React.
- CSS tokens semantic nằm ở `apps/web/src/styles/tokens.css`. Green chỉ dành cho status success/verified/available, không là màu brand.
- Public Homepage, Learner landing, Tutor acquisition có cấu trúc và nhịp màu riêng. Learner search dùng discovery UI; Tutor Dashboard là workspace; Admin dùng UI vận hành ít decoration và mật độ cao hơn.
- Figma được lưu ở [`docs/design/FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md) làm nguồn evidence về bố cục, hierarchy và flow. Finalized references quyết định appearance hiện tại.
- Dữ liệu chỉ là mock/local frontend state; trạng thái chỉ phục vụ tương tác demo. Không suy ra business rules backend từ prototype.

## Responsive và accessibility

Desktop từ 1280px, tablet 768–1279px, mobile dưới 768px. Reflow section, filter, table, calendar và sidebar theo từng loại màn. Focus visible, target đủ lớn, trạng thái có text/icon ngoài màu, body/table dễ đọc. Không copy vị trí tuyệt đối của Figma thành layout cứng.
~~~~

## DESIGN_SOURCE_OF_TRUTH.md

~~~~markdown
# TutorNearMe — Final Visual Foundation

## Status

These three references are now the **visual source of truth** for continued frontend work:

- `reference/final/homepage/`
- `reference/final/learner/`
- `reference/final/tutor/`

They replace the older moss-green / Editorial Utility visual direction.

Do not treat these files as loose inspiration. When implementing or redesigning a
screen, preserve their visual family, typography, spacing rhythm, interaction
language, and color character unless a later explicit design decision replaces it.

---

## Brand direction

TutorNearMe is now a vivid educational marketplace:

- energetic
- colorful
- image-led
- friendly
- youthful but still professional
- high visual contrast
- clear role-specific composition

The brand is **not** a muted SaaS dashboard.

### Core visual family

Across the finalized references the brand family is built from:

- strong blue / deep blue
- red / coral
- yellow
- cyan / light blue
- violet
- cream / warm off-white
- semantic mint/green where appropriate

Exact values may differ slightly between the finalized static references.
Do **not** normalize those colors before achieving visual parity.

For new shared components, prefer semantic tokens instead of hard-coding colors.

### Deprecated visual language

Do not reintroduce the old moss-green / pine identity as a primary brand system.

Deprecated as primary surfaces, navigation, CTA, hero, or brand accents:

- `#2E5B46`
- `#1F2B25`
- `#47534C`
- old `Pine`, `Dark Pine`, `Editorial Utility`, or equivalent moss/olive branding

Semantic green is still allowed for success, verification, availability, etc.
It must not become the dominant brand color again.

---

## Typography

Use the finalized typography direction:

- `Nunito`
- `Nunito Sans`

Vietnamese text must be checked visually.

Avoid bringing back hard/rigid display typography such as the previous
Manrope / Plus Jakarta treatment unless a specific component has an explicit reason.

Default reading size should remain around 16px where the finalized references use it.
Do not shrink table/body content merely to fit more information.

---

## Integrated route model

Recommended integrated routes:

- `/` — main public TutorNearMe homepage
- `/learner` — learner / parent public landing experience
- `/learner/search` — learner discovery/search product flow
- `/tutors/:id` — tutor detail
- `/requests/new`
- `/requests`
- `/tutor` — public tutor acquisition homepage
- `/tutor/register`
- `/tutor/login`
- `/tutor/dashboard`
- `/tutor/profile`
- `/tutor/availability`
- `/tutor/requests`
- `/tutor/requests/:id`
- `/tutor/lessons`

Important: `reference/final/tutor/` is a **public tutor acquisition homepage**.
It is not the Tutor Dashboard.

---

## Role-specific composition

### Main public homepage

Use `reference/final/homepage/` as the direct visual baseline.

Key traits:
- vivid educational marketing rhythm
- large visual hero
- strong color blocks
- discovery/search
- tutor proof
- map/location concept
- offers/content
- CTA sections

### Learner / Parent

Use `reference/final/learner/`.

Key traits:
- same energetic brand
- learner-first copy
- subject + location + availability + fee
- tutor comparison
- request flow
- map interaction
- save/filter/sort
- high information clarity without becoming a generic dashboard

### Tutor

Use `reference/final/tutor/`.

Key traits:
- tutor acquisition and opportunity
- matching requests
- earnings illustration
- profile setup
- availability and schedule concepts
- privacy/trust
- same visual family as Learner, but different product goal

### Admin

No finalized Admin reference exists in this package.

Until one is finalized:
- inherit brand typography and semantic tokens
- use lower color intensity
- prioritize tables, queues, moderation states, and operational clarity
- do not copy the public homepage composition into Admin
- never revive the old moss-green visual system

---

## Implementation rules

Current frontend stack remains:

- React
- JavaScript
- Vite
- React Router
- raw CSS
- Lucide icons where icons are needed

Do not migrate to Tailwind, TypeScript, Next.js, Redux, or another UI framework
unless explicitly requested.

The static references are not production architecture. Port their design into reusable
React components while maintaining visual parity.

Suggested shared primitives:

- `BrandHeader`
- `PublicFooter`
- `PrimaryButton`
- `SecondaryButton`
- `SectionHeading`
- `StatusBadge`
- `TutorCard`
- `TutorPortrait`
- `SearchField`
- `FilterChip`
- `MapPreview`
- `Modal/Dialog`
- role-specific shells

Do not create one universal shell that makes Learner, Tutor, and Admin look identical.

---

## Migration rule

First achieve visual parity with the finalized references.

Only then refactor duplicated values/components.

Refactoring must not silently redesign the pages.
~~~~

## CODEX_PROMPT.md

~~~~markdown
# CODEX TASK — Make the finalized colorful references the new frontend foundation

You are working in the TutorNearMe repository.

The project previously used an older muted moss-green / "Editorial Utility"
visual direction. That direction is now deprecated.

Three finalized static references have been added under:

- `reference/final/homepage/`
- `reference/final/learner/`
- `reference/final/tutor/`

Read `DESIGN_SOURCE_OF_TRUTH.md` before changing code.

## Goal

Make these finalized references the visual foundation for all continued frontend
development.

This is not a request to create another visual direction.

Do not reinterpret the references back into the old green design.

## Priority of truth

When visual instructions conflict, use this order:

1. `reference/final/*` — highest visual authority
2. `DESIGN_SOURCE_OF_TRUTH.md`
3. current product/flow docs
4. older design docs
5. existing implementation

Older screenshots, CSS, or docs using the moss-green system must not override the
new finalized references.

## First: audit the existing React frontend

Inspect `apps/web`.

Report briefly:

- routes currently implemented
- shared layout/components
- where current colors/fonts/tokens are defined
- which active files still contain the old moss-green design
- which existing interactions can be reused

Search specifically for the old branding and report matches such as:

- `#2E5B46`
- `#1F2B25`
- `#47534C`
- `Pine`
- `Dark Pine`
- `Editorial Utility`
- moss / olive themed brand variables

Do not confuse semantic success/verified green with the deprecated brand identity.

## Then perform the migration

### 1. Preserve references

Do not edit files under `reference/final/`.

They are read-only visual references.

### 2. Update design documentation

Update the active design docs so they clearly state:

- old moss-green visual direction is deprecated
- Nunito / Nunito Sans is the current typography family
- public brand is vivid blue/red/yellow/cyan/violet/cream
- the three reference folders are the visual source of truth

If old visual docs are still useful historically, mark their old palette sections
`DEPRECATED` rather than allowing them to remain ambiguous.

### 3. Create semantic frontend tokens

Create/refactor the active React CSS tokens around semantic names such as:

- `--brand-primary`
- `--brand-primary-deep`
- `--brand-accent-red`
- `--brand-accent-yellow`
- `--brand-accent-cyan`
- `--brand-violet`
- `--surface-warm`
- `--surface-light-blue`
- `--text-primary`
- `--text-muted`
- `--border-default`
- semantic success/warning/danger/info tokens

Important:
the finalized references contain slightly different blue/red values between pages.
Do not "fix" this by visibly recoloring the finalized designs during the first pass.

First reproduce the intended appearance. Normalize tokens only when it does not
change visual output.

### 4. Integrated route intent

Use the references with these meanings:

- `/` -> main public homepage based on `reference/final/homepage/`
- `/learner` -> learner/parent public landing based on `reference/final/learner/`
- `/tutor` -> public tutor acquisition homepage based on `reference/final/tutor/`

Keep product routes distinct:

- `/learner/search`
- `/tutors/:id`
- `/requests/new`
- `/requests`
- `/tutor/dashboard`
- `/tutor/profile`
- `/tutor/availability`
- `/tutor/requests`
- `/tutor/requests/:id`
- `/tutor/lessons`

CRITICAL:
`reference/final/tutor/` is NOT the tutor dashboard.

Do not overwrite `/tutor/dashboard` with the public tutor homepage.

### 5. Port, do not paste

The reference files are static HTML/CSS/JS.

Port their visual structure and interaction behavior into the existing
React + JavaScript + Vite app.

Use reusable components where sensible, but do not flatten every page into the same
generic component composition.

Preserve role identity.

### 6. Remove old moss-green branding from active UI

Once the new foundation is wired in:

- remove unused old green variables/classes from active CSS
- replace old active moss-green navigation, CTA, hero, card emphasis, backgrounds
- remove stale imports for the deprecated theme
- do not mass-replace semantic green used for success/verified/available states

Do not delete Git history or unrelated code.

### 7. Keep existing stack

Use:

- React
- JavaScript
- Vite
- React Router
- raw CSS
- Lucide where icons are needed

Do NOT introduce:
- TypeScript
- Tailwind
- Next.js
- Redux
- a new component framework

### 8. Visual behavior to preserve

From Learner reference, preserve:
- filters
- sorting
- save tutor
- map interaction
- modal/detail flow
- mobile navigation

From Tutor reference, preserve/adapt:
- matching request filters
- sorting
- income illustration/calculator
- schedule/availability interactions
- modal interactions

From Main Homepage, preserve:
- bright marketing rhythm
- strong section-to-section color changes
- visual hero
- discovery/search
- map/location concept
- educational content/offer rhythm

### 9. Do not revive generic AI SaaS UI

Avoid:
- white card after white card
- one blue color used everywhere
- moss-green brand accents
- giant empty dashboard whitespace
- identical layout for all roles
- excessive rounded rectangles without hierarchy
- decorative elements with no product meaning

### 10. Verification

Verify at least:

- desktop: 1440px
- tablet: 900–1024px
- mobile: 390px

Check:
- Vietnamese font rendering
- no text clipping
- no button label collision
- no horizontal overflow except intentionally scrollable tables
- modal keyboard behavior
- direct route loading under React Router/Vercel
- console errors
- `npm run build`

## Execution order

1. Audit current frontend and report what will be changed.
2. Update docs/tokens.
3. Implement `/`.
4. Implement `/learner`.
5. Implement `/tutor`.
6. Replace old active green branding in shared UI.
7. Re-style existing product screens progressively using the correct role family.
8. Run visual/build verification.
9. Report changed files, route status, remaining TODOs, and any old green matches left.

Do not stop after creating tokens or documentation.
Carry the migration through to working routes.
~~~~

## apps/web/README.md

~~~~markdown
# TutorNearMe Web

Interactive prototype frontend-only dùng React, JavaScript, Vite, React Router, CSS thuần và Lucide Icons. Nunito/Nunito Sans được self-host bằng Fontsource, gồm glyph Latin và tiếng Việt.

## Chạy local

```sh
npm install
npm run dev
```

Mở URL do Vite in ra terminal. Kiểm tra production build bằng `npm run build`.

## Route hiện có

- `/` — trang chủ public theo `reference/final/homepage/`.
- `/learner` — landing Người học / Phụ huynh theo `reference/final/learner/`.
- `/tutor` — landing tuyển gia sư theo `reference/final/tutor/`; không phải dashboard.
- `/learner/search` — tìm và lọc gia sư; hồ sơ nhanh chuyển sang form yêu cầu đầy đủ.
- `/tutors/:id`, `/requests/new`, `/requests`, `/requests/:id` — hồ sơ, tạo và theo dõi yêu cầu học demo.
- `/tutor/dashboard` — xem agenda, xử lý yêu cầu, xem lịch tuần và bật/tắt lịch rảnh demo.
- `/tutor/profile`, `/tutor/availability`, `/tutor/requests`, `/tutor/requests/:id`, `/tutor/lessons` — các màn sản phẩm gia sư demo.
- `/admin/dashboard` — xem bảng vận hành, duyệt hồ sơ và đánh giá demo.

Thanh **Xem giao diện** trên các màn workspace giúp chuyển nhanh giữa ba role. Các chức năng chưa có UI không được gắn vào route giả.

## Cấu trúc

- `src/components/`: các UI primitive thực sự dùng chung.
- `src/features/public`: ba landing public, header/footer và UI dùng riêng cho public pages.
- `src/features/learner`, `tutor`, `admin`: sản phẩm theo role và CSS đặc thù.
- `src/data/`: mock data tách khỏi JSX.
- `src/hooks/`: local demo persistence dùng chung.
- `src/styles/`: semantic tokens, reset, global, tiện ích và form/list style dùng chung.
- `src/App.jsx`, `src/main.jsx`: routing và entry point.

Một số thao tác sản phẩm demo, gồm hồ sơ đã lưu và yêu cầu học, được lưu trong localStorage để đi giữa route và reload mà không mất trạng thái. Sáu hồ sơ gia sư dùng chung `src/data/tutors.js`; `src/data/public.js` chỉ chuyển dữ liệu đó sang cách trình bày landing. Các bộ lọc trên landing chỉ giữ trong local state. Không có backend hoặc API.
~~~~

## apps/web/src/features/learner/DESIGN.md

~~~~markdown
# Learner UI Design Notes

Active visual source: `reference/final/learner/` and root `DESIGN.md`. The older moss-green Editorial Utility palette is deprecated. Learner search and product flow inherit the vivid blue/red/yellow/cyan family while retaining comparison clarity.

- Primary goal: discover a suitable tutor quickly and confidently.
- Search/filter and tutor cards/details are the main visual anchors.
- Price, subject, area, availability and rating must be easy to compare.
- CTA hierarchy: primary = view/request/confirm; destructive actions visually secondary.
- Prefer generous whitespace over admin-style density.
- Must use shared palette/tokens once approved; do not invent a separate learner brand.
~~~~

## apps/web/src/features/tutor/DESIGN.md

~~~~markdown
# Tutor UI Design Notes

Active visual source: `reference/final/tutor/` and root `DESIGN.md`. The reference is a public acquisition page; `/tutor/dashboard` remains a separate workspace. The older moss-green palette is deprecated.

- Primary goal: manage tutor profile, availability, requests and lessons efficiently.
- Dashboard should surface pending requests, upcoming lessons and incomplete profile items.
- Schedule/availability controls must be clearer than decorative content.
- State transitions (pending/accepted/rejected/completed) need consistent semantic badges.
- Medium information density: denser than learner UI, lighter than admin UI.
~~~~

## apps/web/src/features/admin/DESIGN.md

~~~~markdown
# Admin UI Design Notes

No finalized Admin page is supplied. Inherit Nunito/Nunito Sans and semantic tokens from root `DESIGN.md`, with lower color intensity and operational density. The older moss-green palette is deprecated.

- Primary goal: operate the system quickly.
- High information density with strong scanability.
- Tables, filters, search, status and bulk/detail actions have priority.
- Avoid oversized hero sections, decorative gradients and excessive card nesting.
- Keep consistent global typography/tokens; admin may use tighter spacing scale variants where needed.
~~~~

## docs/requirements/FUNCTIONAL_REQUIREMENTS.md

~~~~markdown
# Functional Requirements

## Learner / Parent

- Đăng ký / đăng nhập.
- Tìm kiếm gia sư.
- Lọc theo môn học, khu vực, lịch rảnh, học phí.
- Xem hồ sơ gia sư.
- Gửi yêu cầu học.
- Theo dõi yêu cầu đã gửi.
- Xem trạng thái lịch/buổi học.
- Đánh giá gia sư sau buổi học.

## Tutor

- Đăng ký / đăng nhập.
- Tạo / sửa hồ sơ gia sư.
- Chọn môn dạy.
- Nhập mức phí.
- Chọn khu vực dạy.
- Khai báo lịch rảnh.
- Nhận yêu cầu học.
- Xem chi tiết yêu cầu.
- Chấp nhận / từ chối yêu cầu.
- Xem lịch đã xác nhận.
- Đánh dấu buổi học hoàn thành.

## Admin

- Đăng nhập admin.
- Dashboard tổng quan.
- Quản lý người dùng.
- Quản lý gia sư.
- Quản lý môn học.
- Quản lý đánh giá.
- Xử lý tài khoản có vấn đề.

## Supporting requirements suy ra trực tiếp từ phạm vi

- Quản lý khu vực/location vì đây là dữ liệu bắt buộc của matching/filter.
- Có trạng thái rõ ràng cho TutoringRequest và buổi học.
- Có quyền truy cập theo role.

Các tính năng ngoài MVP phải được đánh dấu rõ trong backlog thay vì lẫn vào core scope.
~~~~

## docs/requirements/NON_FUNCTIONAL_REQUIREMENTS.md

~~~~markdown
# Non-functional Requirements – Khung ban đầu

Đây là yêu cầu kỹ thuật khuyến nghị để đội phát triển có điểm thống nhất; không phải toàn bộ đều được nêu trực tiếp trong file đề tài.

- Responsive trên desktop/tablet/mobile.
- Phân quyền theo role.
- Validation form phía client và server.
- API error states rõ ràng.
- Không để thông tin nhạy cảm trong source control.
- Keyboard focus và contrast ở mức cơ bản.
- Loading / empty / error states cho màn hình dữ liệu.
- Component tái sử dụng và design tokens thống nhất.
- Logging server đủ để debug các thao tác quan trọng.
~~~~

## docs/planning/MVP_SCOPE.md

~~~~markdown
# MVP Scope

## In scope

- Auth cơ bản.
- Tutor profile.
- Subject / location / availability / fee.
- Tutor search + filter.
- Send tutoring request.
- Tutor accept/reject.
- Confirmed schedule / lesson status.
- Learner request tracking.
- Mark lesson completed.
- Review after lesson.
- Admin dashboard + user/tutor/subject/review/account-issue management.

## Out of initial MVP / Phase 2

- Map view thật, geocoding và distance matching. Các landing hiện có map **minh họa bằng local state** theo finalized reference; không dùng map API hoặc tọa độ thật.
- Realtime chat.
- Learning packages.
- Student-card verification automation.
- Distance ranking/matching algorithm nâng cao.
- Payment.

## Quy tắc scope

Nếu một tính năng mới không hỗ trợ trực tiếp core flow, đưa vào `BACKLOG.md` trước khi implement.
~~~~

## docs/planning/BACKLOG.md

~~~~markdown
# Backlog

## P1 – Core

- [ ] Chốt design direction + palette.
- [ ] Chốt auth/role model.
- [ ] Chốt entity schema.
- [ ] Learner core flow.
- [ ] Tutor core flow.
- [ ] Admin core flow.
- [ ] Responsive + visual QA.

## P2 – Nice to have

- [ ] Map view.
- [ ] Tutor verification.
- [ ] Chat.
- [ ] Learning packages.
- [ ] Distance matching.

## P3 – Course delivery

- [ ] Requirement document.
- [ ] Final design/wireframe.
- [ ] GitHub cleanup.
- [ ] Slide.
- [ ] Demo URL.
~~~~

## docs/flows/LEARNER_FLOW.md

~~~~markdown
# Flow 1 – Người học / Phụ huynh

Mục tiêu: **Tìm và kết nối gia sư phù hợp**.

Luồng gốc:

1. Đăng ký / Đăng nhập tài khoản.
2. Tìm kiếm gia sư.
3. Lọc theo môn học, khu vực, lịch rảnh, học phí.
4. Xem hồ sơ gia sư.
5. Gửi yêu cầu học.
6. Theo dõi yêu cầu đã gửi.
7. Đánh giá gia sư sau buổi học.

### Screen breakdown đề xuất

- Auth entry.
- Tutor discovery/search.
- Filter/search result state.
- Tutor profile detail.
- Create tutoring request.
- Request submitted confirmation.
- My requests.
- Request detail/status.
- Confirmed lesson/session detail.
- Review submission.

`Search + Filter + Results` có thể là cùng một page nếu UX tốt; không bắt buộc tách thành 3 route.
~~~~

## docs/flows/TUTOR_FLOW.md

~~~~markdown
# Flow 2 – Gia sư

Mục tiêu: **Tạo hồ sơ và nhận học viên**.

Luồng gốc:

1. Đăng ký / Đăng nhập tài khoản.
2. Tạo / sửa hồ sơ gia sư.
3. Chọn môn dạy.
4. Nhập mức phí.
5. Chọn khu vực.
6. Khai báo lịch rảnh.
7. Nhận yêu cầu học từ người học.
8. Chấp nhận / Từ chối yêu cầu.
9. Đánh dấu buổi học hoàn thành.

### Screen breakdown đề xuất

- Tutor auth / onboarding.
- Tutor dashboard.
- Profile editor.
- Subject selection.
- Pricing settings.
- Teaching locations.
- Availability calendar/editor.
- Request inbox.
- Request detail.
- Accept/reject confirmation.
- Confirmed schedule.
- Lesson/session detail.
- Complete lesson action.
~~~~

## docs/flows/ADMIN_FLOW.md

~~~~markdown
# Flow 3 – Admin

Mục tiêu: **Quản lý và vận hành hệ thống**.

Luồng gốc:

1. Đăng nhập Admin.
2. Dashboard tổng quan hệ thống.
3. Quản lý người dùng (User).
4. Quản lý gia sư (Tutor).
5. Quản lý môn học (Subject).
6. Quản lý đánh giá (Review).
7. Xử lý tài khoản có vấn đề.

### Screen breakdown đề xuất

- Admin login.
- Admin dashboard.
- User list + filter.
- User detail.
- Tutor list + filter.
- Tutor detail / verification / status.
- Subject list + create/edit.
- Review moderation/list/detail.
- Account issue / suspended request list.
- Issue/ticket detail.
- Location management (supporting core matching data).

Các màn Reports/Complaints, System Logs, Permissions, System Settings đang có thể xuất hiện trong Figma tham khảo nhưng nên xếp sau core MVP nếu môn học không yêu cầu.
~~~~

## docs/architecture/ARCHITECTURE.md

~~~~markdown
# Architecture — frontend prototype hiện hành

> Phần mô tả backend/database trong bản scaffold cũ chỉ còn ở `docs/archive/LEGACY_SCAFFOLD.md`. Giai đoạn hiện tại không có API, database hoặc authorization server-side.

## Mục tiêu

Tách giao diện public và ba role trong một React/Vite app. Dữ liệu minh họa ở `src/data`; local state và localStorage chỉ phục vụ prototype.

```text
apps/web
  src/App.jsx — React Router
  src/components — primitive dùng chung
  src/data — mock data
  src/styles — token, reset, global, shared flow styles
  src/hooks — local demo state helper
  features/public — 3 landing và public UI
  features/learner
  features/tutor
  features/admin
```

## Frontend

- Router ở `src/App.jsx`; entry point ở `src/main.jsx`.
- Shared UI primitives ở `src/components`.
- Semantic tokens ở `src/styles/tokens.css`.
- Business UI theo role ở `src/features/*`.
- Không có API client hoặc auth guard backend.

## Visual boundary

`reference/final/*` là nguồn appearance; Figma analysis là nguồn structural evidence. Workspace Tutor và Admin không dùng cùng shell với public landing. Các route và trạng thái hiện tại là demo UI, chưa phải quy tắc nghiệp vụ cuối cùng.
~~~~

## docs/architecture/ROUTING_AND_ROLES.md

~~~~markdown
# Routing & Role Boundaries

React Router hiện dùng trong `apps/web/src/App.jsx`. Những route bên dưới là bản tích hợp hiện tại; các mục trong screen inventory chưa có route sẽ tiếp tục là backlog.

## Public landing

- `/` — trang chủ theo `reference/final/homepage/`.
- `/learner` — landing Người học / Phụ huynh theo `reference/final/learner/`.
- `/tutor` — landing tuyển gia sư theo `reference/final/tutor/`; không phải dashboard.

## Public / Learner

- `/learner/search`
- `/tutors/:id`
- `/requests/new`
- `/requests`
- `/requests/:id`

`/requests/:id` chứa trạng thái buổi học và form review demo khi đã hoàn tất. Login/Register, lesson detail và review route riêng vẫn nằm trong inventory/backlog.

## Tutor

- `/tutor/dashboard`
- `/tutor/profile`
- `/tutor/availability`
- `/tutor/requests`
- `/tutor/requests/:id`
- `/tutor/lessons`

Môn dạy, mức phí và khu vực hiện gộp trong `/tutor/profile`. Lesson detail riêng vẫn nằm trong inventory/backlog.

## Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/users`
- `/admin/users/:id`
- `/admin/tutors`
- `/admin/tutors/:id`
- `/admin/subjects`
- `/admin/reviews`
- `/admin/issues`
- `/admin/issues/:id`
- `/admin/locations`

Admin hiện mới có `/admin/dashboard`. Các route Admin khác trong bảng trên là **planned**, chưa được implement. Prototype không có guard/auth backend.
~~~~

## docs/data/DATA_MODEL.md

~~~~markdown
# Data Model – Domain Draft

> Tài liệu phân tích nghiệp vụ lịch sử. Prototype hiện tại là frontend-only; các entity bên dưới không phải schema được triển khai và không quyết định database/backend.

## Entities nêu trực tiếp trong đề tài

### User
Tài khoản chung; role xác định learner/parent, tutor hoặc admin.

### TutorProfile
Thông tin công khai/chuyên môn của gia sư.

### Subject
Môn học mà gia sư có thể dạy và learner có thể tìm kiếm.

### Location
Khu vực dạy/học, phục vụ filter và hyperlocal matching.

### Availability
Các khung giờ gia sư khai báo rảnh.

### TutoringRequest
Yêu cầu học gửi từ learner tới tutor, có trạng thái xử lý.

### Review
Đánh giá sau buổi học.

## Entity khuyến nghị bổ sung khi triển khai

Các entity dưới đây **không nằm trong danh sách dữ liệu chính của sheet**, nhưng giúp biểu diễn requirement rõ hơn.

### TutoringSession / Lesson
Đại diện lịch đã xác nhận và trạng thái buổi học; cần cho yêu cầu “trạng thái buổi học” và hành động “đánh dấu hoàn thành”.

### TutorSubject
Quan hệ nhiều-nhiều giữa TutorProfile và Subject nếu một tutor dạy nhiều môn.

### TutorLocation
Quan hệ tutor – khu vực dạy nếu một tutor nhận nhiều khu vực.

## Optional entities

- ChatConversation / ChatMessage.
- LearningPackage.
- TutorVerification.
- Notification.
~~~~

## docs/deliverables/COURSE_DELIVERABLES.md

~~~~markdown
# Course Deliverables Checklist

Theo sheet đề tài, output cần nộp gồm:

- [ ] Requirement.
- [ ] User flow.
- [ ] Wireframe / UI design.
- [ ] GitHub repository.
- [ ] Slide.
- [ ] Demo URL.

Khuyến nghị thêm trong repo:

- [ ] README có hướng dẫn chạy.
- [ ] `.env.example`.
- [ ] Seed/demo account.
- [ ] Screenshot hoặc short demo GIF/video link.
- [ ] Known limitations.
~~~~

## docs/design/VISUAL_DIRECTION.md

~~~~markdown
# DEPRECATED — TutorNearMe Editorial Utility (historical specification)

> Hệ màu xanh rêu, Source Sans 3 và Literata dưới đây đã được thay thế bởi ba reference trong `reference/final/` và `DESIGN_SOURCE_OF_TRUTH.md`. Giữ tài liệu này để đối chiếu lịch sử; không dùng cho UI mới. Xem `DESIGN.md` ở root để bắt đầu.

## Mục đích và ranh giới nguồn

Đây là visual direction đã được duyệt cho interactive prototype frontend-only của TutorNearMe. Hướng này dùng **Learning Editorial** làm nền tảng thương hiệu và **Clear Ledger** làm ngôn ngữ UI vận hành. Dữ liệu là mock/demo và state là local frontend; tài liệu này chỉ quy định hình ảnh và hành vi UI.

Tỷ lệ dưới đây định hướng mức độ nhấn, không tạo thành ba theme riêng:

| Role | Editorial | Clear Ledger | Cảm nhận cần đạt |
|---|---:|---:|---|
| Learner / Parent | 70% | 30% | Khám phá và so sánh thoáng, tạo cảm giác an tâm |
| Tutor | 35% | 65% | Workspace chuyên nghiệp, tập trung yêu cầu và lịch |
| Admin | 20% | 80% | Workspace vận hành gọn, phân cấp dữ liệu rõ |

Giữ Figma làm **structural reference** cho hierarchy layout, navigation, cách sắp section, grouping thông tin và interaction pattern hữu ích. Palette, typography, icon placeholder, decoration, shadow, radius và spacing chính xác của Figma không bắt buộc giữ. Xem [FIGMA_ANALYSIS.md](FIGMA_ANALYSIS.md) để tra findings cùng nhãn nguồn/evidence; không nhập nội dung evidence log đó vào đặc tả này.

## 1. Brand principles

- **Tinh thần giáo dục điềm tĩnh:** ấm áp, đáng tin, không dùng motif lớp học trẻ con.
- **Tạo niềm tin bằng sự rõ ràng:** thông tin nhận diện, năng lực, môn học, khu vực, lịch rảnh, học phí và trạng thái gia sư phải có hierarchy dễ đọc.
- **Tiết chế kiểu editorial:** typography hiển thị và whitespace tạo cá tính; không trang trí mọi bề mặt.
- **Tính vận hành khi cần xử lý công việc:** Tutor và Admin ưu tiên action, status, lịch và tốc độ quét thông tin.
- **Một thương hiệu, trải nghiệm riêng theo role:** dùng chung nền tảng token và quy ước tương tác, nhưng không làm ba dashboard chỉ khác dữ liệu.
- **Accessibility là nền tảng:** contrast, cỡ chữ, focus bàn phím và cách biểu thị trạng thái không phụ thuộc màu sắc.

## 2. Final color roles

Các giá trị dưới đây là token khởi điểm đã duyệt. Vai trò của token ổn định; có thể tinh chỉnh hex qua visual/accessibility review nhưng cần giữ tính cách palette và độ tương phản.

| Token | Giá trị | Vai trò |
|---|---|---|
| Canvas | `#F6F4EE` | Nền trang off-white ấm |
| Surface | `#FFFEFA` | Surface nội dung chính, form và overlay |
| Surface muted | `#EFEEE7` | Grouping nhẹ và vùng nền thay thế |
| Ink | `#1F2B25` | Text chính và nhấn trung tính mạnh |
| Text secondary | `#47534C` | Nội dung hỗ trợ |
| Text muted | `#647069` | Label phụ, chỉ dùng khi còn đủ contrast |
| Brand pine | `#2E5B46` | Action chính, navigation được chọn, link phù hợp |
| Terracotta | `#A64F38` | Điểm nhấn phụ tiết chế, nhất là nét editorial Learner |
| Border | `#D6DAD2` | Divider và viền control mặc định |
| Border strong | `#AAB4AB` | Ranh giới rõ hơn và cấu trúc table |

Ví dụ màu ngữ nghĩa:

| Trạng thái | Foreground | Background |
|---|---|---|
| Success | `#276246` | `#E8F0EA` |
| Warning | `#805400` | `#F7F0DE` |
| Danger | `#A33C35` | `#F7EAE7` |
| Info | `#355F70` | `#EAF0F2` |

Màu ngữ nghĩa phải đi kèm nhãn và khi hữu ích có thể thêm icon/dấu hiệu khác. Không để terracotta thành màu primary cạnh tranh hoặc dùng màu đơn lẻ để phân biệt trạng thái. Text cần đạt contrast theo WCAG AA (4.5:1 cho text thường; 3:1 cho text lớn và ranh giới/đồ họa UI có ý nghĩa khi phù hợp). Khi triển khai cần kiểm tra lại từng cặp token thực tế.

## 3. Typography system

- **Source Sans 3** là lựa chọn mặc định đã duyệt cho body và UI trên các role.
- **Literata** được duyệt để dùng tiết chế cho heading hiển thị/hero của Learner; không dùng trong table, form, ô calendar hay label UI nhỏ.
- Admin chỉ dùng sans-serif. Tutor phần lớn dùng sans-serif; khu vực vận hành không cần serif display.
- Đây là các font mặc định đã duyệt, **không phải dependency bất biến**. Nếu implementation cho thấy lỗi hiển thị tiếng Việt, giảm readability hoặc không tương thích kỹ thuật, chọn font tương đương có glyph tiếng Việt phù hợp và đặc tính thị giác/metrics gần tương tự. Cập nhật tài liệu này và `DESIGN.md`, ghi rõ lựa chọn thay thế và lý do.
- Ưu tiên sentence case, label ngắn, căn chỉnh số nhất quán và phân biệt rõ heading, body, metadata, status.

## 4. Type scale

Dùng scale sau làm điểm xuất phát; điều chỉnh line height và weight theo metrics của font đã chọn và dấu tiếng Việt:

| Vai trò | Cỡ / line-height | Ví dụ sử dụng |
|---|---|---|
| Display | 40 / 48 px | Chỉ hero trang discovery Learner |
| Page title | 32 / 40 px | Tiêu đề trang chính; giảm khi view dày thông tin |
| Section title | 24 / 32 px | Section nội dung chính |
| Subsection | 20 / 28 px | Nhóm nội dung phụ hoặc detail |
| Lead | 18 / 28 px | Đoạn giới thiệu hoặc summary được nhấn |
| Body | 16 / 24 px | Nội dung đọc và form mặc định |
| Compact body | 14 / 20 px | Control dày, metadata và table; không dùng làm body mặc định |
| Caption | 12 / 16 px | Label phụ, không dùng cho hướng dẫn thiết yếu |

Chỉ dùng display size khi cần. Heading dashboard không được lấn át nội dung vận hành. Tránh label viết hoa toàn bộ dài và weight quá mảnh trên nền ấm.

## 5. Spacing scale

Spacing token cơ sở: **4, 8, 12, 16, 24, 32, 40, 48, 64 px**. Cùng một scale được dùng xuyên suốt; density mode chọn giá trị phù hợp thay vì đặt spacing riêng cho từng màn.

### Quy tắc layout/container

- **Learner desktop:** căn giữa nội dung chính trong max-width container nhất quán, chọn giá trị trong khoảng **1200–1280px** tùy màn hình. Tái sử dụng container đó giữa search, profile và request khi hierarchy nội dung cho phép. View nhỏ dùng width linh hoạt và responsive side padding.
- **Tutor/Admin workspace:** shell có thể dùng nhiều chiều rộng viewport hơn Learner, nhất là calendar và table dữ liệu. Giữ page padding nhất quán trong từng shell và chọn theo density token bên dưới. Không để mỗi màn tự đặt left/right padding tùy ý.
- Giới hạn độ rộng vùng đọc/form thấp hơn workspace khi điều đó giúp dễ đọc. Layout dữ liệu thực sự rộng có thể dùng không gian khả dụng.
- Group section bằng spacing, alignment, heading, divider và chuyển nền có chủ đích trước khi thêm card.

## 6. Density modes

Density là quy tắc cấp role và phải ổn định giữa các màn. Một view có thể điều chỉnh cục bộ để vừa nội dung, nhưng không âm thầm đổi density tổng thể.

| Mode | Role | Page padding (desktop / tablet / mobile) | Khoảng cách section thường dùng | Chiều cao control thường dùng | Row table/list thường dùng |
|---|---|---|---|---|---|
| Comfortable | Learner / Parent | 32 / 24 / 16 px | 32–48 px | 44–48 px | 64–88 px cho nội dung so sánh gia sư |
| Standard | Tutor | 24 / 20 / 16 px | 24–32 px | 40–44 px | 52–64 px |
| Compact | Admin | 20 / 16 / 12 px | 16–24 px | 34–40 px | 40–48 px |

Đây là mục tiêu bố cục, không phải lý do giảm readability hoặc vùng tương tác. Trên thiết bị cảm ứng, vẫn giữ target đủ lớn dù cách trình bày dữ liệu xung quanh gọn. Compact mode giảm padding và nhịp row, không làm text thiết yếu nhỏ hơn type scale.

## 7. Radius scale

- `4px`: control gọn, action trong table và surface tiện ích Admin.
- `6px`: control và panel workspace Tutor.
- `8px`: button, input và container dùng chung mặc định.
- `10–12px`: card gia sư Learner, surface discovery và một số container editorial.
- `999px`: chỉ dùng cho chip status/tag ngắn khi nội dung phù hợp.

Không dùng dáng pill cho mọi button, input, tab hoặc card. Khác biệt giữa role nên thể hiện chủ yếu qua hierarchy và density, không phải các hệ hình dạng rời rạc.

## 8. Border và elevation

- Ưu tiên border/divider trung tính 1px cho control và cấu trúc table.
- Chỉ dùng border mạnh hơn để làm rõ grouping, lựa chọn đang active hoặc focus bàn phím.
- Elevation dùng tiết chế cho overlay, popover, menu và một số ít surface nổi.
- Tránh shadow thường trực quá nặng, border lồng nhau và card bên trong card.
- Chỉ đổi nền khi giúp làm rõ vùng nội dung hoặc trạng thái tương tác có ý nghĩa.

## 9. Icon rules

- **Lucide** là icon family mặc định đã duyệt, không phải dependency bất biến. Giữ một family và stroke language nhất quán giữa các role.
- Cỡ icon thường dùng 18–20px; control tiện ích Admin dày có thể dùng 16px nếu vẫn rõ và target không bị thu nhỏ.
- Icon hỗ trợ label hoặc action quen thuộc. Không thay label thiết yếu bằng icon khó hiểu.
- Không dùng emoji, Unicode glyph tùy tiện hoặc placeholder từ Figma làm icon final.
- Có thể thay Lucide bằng icon family tương đương nếu cần vì rendering hoặc technical compatibility; cập nhật đặc tả này và `DESIGN.md` kèm lý do.

## 10. Button rules

- **Primary:** nền pine, label tương phản cao, động từ rõ; mỗi vùng quyết định chỉ có một action primary nổi bật.
- **Secondary:** surface ấm, border trung tính thấy rõ, text ink.
- **Tertiary/quiet:** text hoặc mức nhấn thấp cho navigation và action inline ít rủi ro.
- **Destructive:** dùng treatment màu danger; yêu cầu xác nhận với action có hệ quả lớn.
- Learner có thể dùng terracotta làm CTA phụ hoặc điểm nhấn editorial tiết chế, nhưng pine vẫn là action thương hiệu chính dùng chung.
- Button cần thể hiện default, hover, focus-visible, pressed, disabled và loading khi phù hợp. Disabled vẫn phải đọc được.
- Target phù hợp loại thiết bị nhập liệu; density gọn không được tạo target chạm quá nhỏ.

## 11. Input/form rules

- Dùng surface trắng ấm, label rõ, ranh giới dễ thấy và chiều cao control theo density mode của role.
- Label luôn hiển thị kể cả khi đã nhập; placeholder là ví dụ/gợi ý, không phải label duy nhất.
- Focus cần có outline/border rõ, tránh chỉ đổi màu nếu có thể.
- Helper text, validation và lỗi đặt cạnh field liên quan. Lỗi cần đi kèm text/icon hoặc dấu hiệu khác ngoài màu.
- Nhóm field liên quan bằng spacing và heading; tránh bọc từng field thành card riêng.
- Ưu tiên pattern control ngày, giờ và lựa chọn quen thuộc/dễ hiểu.

## 12. Badge/status rules

- Dành badge gọn cho status, category và tag metadata ngắn.
- Kết hợp màu ngữ nghĩa với text tường minh; có thể thêm icon để củng cố ý nghĩa.
- Giữ wording trạng thái nhất quán giữa dashboard card, table, detail, schedule và request.
- Không biến mọi môn học, filter và metadata thành pill màu. Dùng text thường hoặc chip trung tính cho metadata không phải status.
- Trạng thái disabled, pending, confirmed, completed, cancelled và review/approval phải phân biệt được ở grayscale và với người khó phân biệt màu.

## 13. Card/surface rules

- Canvas ấm là nền mặc định. Surface trắng ấm dành cho nội dung cần ranh giới riêng như item so sánh gia sư, vùng form, detail panel hoặc overlay.
- Chỉ dùng card khi nội dung độc lập để scan/action hoặc thực sự cần container riêng. Không bọc mọi section bằng card.
- Card Learner có thể thoáng hơn với radius medium. Panel Tutor nên phẳng và có cấu trúc. Surface Admin phần lớn phẳng, phân tách bằng divider.
- Dùng alignment, whitespace, heading, separator và chuyển nền tiết chế để tạo hierarchy trước khi thêm shadow hay panel trang trí.

## 14. Table rules

- Ưu tiên hierarchy cột rõ, alignment ổn định, header ngắn, ranh giới row thấy được và status/action đặt gần record liên quan.
- Căn ngày, số lượng và tiền nhất quán. Không cắt identifier hoặc status chính nếu không có cách xem đầy đủ.
- Action theo row dễ tìm nhưng không lấn át dữ liệu. Dùng detail panel/drawer nếu workflow sẵn có hỗ trợ.
- Admin table theo compact density; text nội dung chính thường từ 14px trở lên, row height nhất quán. Metadata phụ có thể nhẹ hơn nhưng không được khó đọc.
- Ở màn hẹp, chọn chiến lược rõ cho từng table: scroll ngang có context, ưu tiên một số cột hoặc chuyển thành danh sách record. Không ép mọi cột vào chiều rộng gây khó đọc.

## 15. Calendar rules

- Giữ hierarchy thứ/ngày/giờ, thời lượng event và trạng thái dễ đọc. Dùng grid line rõ cùng event surface tiết chế thay vì card nặng.
- Không dùng serif trong ô calendar. Dùng label sans-serif và thông tin event ngắn.
- Phân biệt confirmed, upcoming và awaiting confirmation bằng label kèm màu/treatment.
- Desktop giữ geometry tuần hữu ích. Tablet/mobile chuyển sang agenda/day dễ đọc hoặc scroll ngang có chủ đích thay vì thu nhỏ text.
- Thể hiện empty, selected và current-day state mà không chỉ dựa màu. Control event phải thao tác được ở kích thước chạm.

## 16. Learner / Parent adaptation

- Giữ top navigation và luồng trang hướng khám phá từ structural reference.
- Dùng comfortable density và container desktop nhất quán rộng tối đa 1200–1280px.
- Hero/search có đủ nét editorial để giới thiệu mục đích, sau đó nhường ưu tiên hình ảnh cho filter, so sánh và chi tiết gia sư.
- Chỉ dùng Literata cho heading hiển thị tiết chế nếu tiếng Việt được render rõ và dễ đọc; body, label, filter, form và dữ liệu gia sư dùng sans-serif.
- Trình bày môn, khu vực, lịch, học phí, rating và thông tin tạo tin cậy theo alignment dễ so sánh. Ưu tiên ít card gia sư nổi bật hơn một lưới card trang trí đồng đều.
- Đặt action gửi yêu cầu gần gia sư được chọn và làm rõ bước tiếp theo.
- Giữ whitespace và surface radius medium thân thiện, nhưng không làm mất mật độ thông tin cần để so sánh.

## 17. Tutor adaptation

- Giữ workspace/sidebar và topbar theo structural reference.
- Dùng standard density: dày hơn Learner, page padding nhất quán 24/20/16px theo tier viewport.
- Làm agenda, incoming requests, availability và buổi học sắp tới thành trọng tâm vận hành.
- Ưu tiên grid căn chỉnh, separator và summary gọn hơn card trang trí. Chỉ dùng surface cho task độc lập hoặc detail tập trung.
- Phần lớn UI dùng sans-serif. Hiển thị action pending và lesson status cạnh request/session liên quan.
- Giữ control calendar/editor và quyết định request dễ tiếp cận mà không biến dashboard thành một bảng notification dày đặc.

## 18. Admin adaptation

- Giữ operational sidebar/topbar và hierarchy dữ liệu từ structural reference.
- Dùng compact density, page padding nhất quán 20/16/12px theo tier viewport.
- Chỉ dùng sans-serif. Tiêu đề thực dụng, tỷ lệ vừa phải với workspace dày thông tin.
- Ưu tiên table, filter, status, detail panel và action. Dùng surface phẳng và divider thay shadow.
- Dùng màu thương hiệu tiết chế cho navigation và action chính; màu ngữ nghĩa dành cho trạng thái và ý nghĩa action.
- Giữ tốc độ scan qua alignment cột ổn định, label gọn, vị trí filter nhất quán, status/action ở gần record. Đảm bảo text dễ đọc và focus rõ dù compact.

## 19. Responsive principles

Thiết kế cho desktop (≥1280px), tablet (768–1279px) và mobile (<768px), nhưng để nội dung và shell quyết định hành vi ở các breakpoint trung gian.

- Reflow bằng responsive container và grid; không bê tọa độ pixel desktop sang hoặc chỉ scale nhỏ lại.
- Learner: giữ top navigation khi đủ chỗ, đơn giản hóa ở viewport hẹp; xếp card so sánh; chuyển filter phức tạp vào drawer/sheet; đưa request panel thành inline hoặc full-width.
- Tutor: thu sidebar thành drawer hoặc navigation gọn phù hợp; giảm số cột dashboard; dùng agenda/day calendar trên màn nhỏ.
- Admin: giữ action/filter quan trọng dễ tới; thu navigation; ưu tiên cột table hoặc dùng record list/detail dễ đọc.
- Chọn page padding theo density mode của role. Tránh gutter riêng từng màn khiến shell thay đổi thất thường.
- Kiểm tra text tiếng Việt dài, wrapping, empty/loading/error state và thứ tự focus bàn phím trên màn hẹp.

## 20. Motion rules

- Transition nhanh, tiết chế, thường trong khoảng **120–200ms**.
- Chỉ animate để truyền đạt state, hierarchy hoặc navigation: focus, phản hồi pressed, disclosure, drawer/modal, loading progress và đổi status.
- Tránh chuyển động trang trí, parallax, spring nảy và page transition lớn.
- Tôn trọng reduced-motion preference; state change phải rõ ngay cả khi tắt animation.

## 21. Anti-patterns

- Gradient tím/xanh kiểu SaaS, gradient ngẫu nhiên hoặc glassmorphism.
- Card bo quá nhiều, mọi control dạng pill, hoặc mọi section đều bọc card.
- Shadow nặng, surface lồng nhau và decoration cạnh tranh với nội dung.
- Typography dashboard quá cỡ hoặc hero rộng rỗng trong view vận hành.
- Dùng serif trong table, form, calendar cell hoặc label nhỏ.
- Body/table quá nhỏ, contrast thấp, ẩn label hoặc focus khó nhìn.
- Trạng thái chỉ phân biệt bằng màu, wording status không nhất quán, hoặc mỗi role dùng một icon family khác.
- Dùng emoji/glyph placeholder trong Figma làm icon final.
- Responsive chỉ thu nhỏ desktop hoặc làm chữ calendar/table không đọc được.
- Tùy tiện thay density, page padding, row height hoặc control giữa các màn.

## 22. Do / Don't examples

| Nên làm | Tránh làm |
|---|---|
| Dùng Learner container desktop căn giữa, lặp lại nhất quán trong khoảng 1200–1280px. | Mỗi trang Learner đặt max-width bất kỳ khác nhau. |
| Cho Tutor/Admin dùng chiều rộng workspace, page padding chọn theo density mode. | Kéo dữ liệu sát cạnh không có inset hoặc tự đặt gutter từng màn. |
| Tạo hierarchy bằng whitespace, section heading và divider trước khi thêm surface. | Đưa mọi vùng dashboard vào card nổi bo tròn. |
| Dùng serif tiết chế cho hero Learner khi tăng được nét editorial. | Dùng serif trong form, table dữ liệu hoặc label calendar. |
| Giữ font và Lucide làm mặc định; ghi lại lựa chọn tương đương nếu gặp lỗi rendering/readability/compatibility. | Coi font và icon mặc định đã duyệt là dependency không thể thay. |
| Ghép status label với màu ngữ nghĩa và wording nhất quán. | Chỉ dùng màu để phân biệt pending/approved/cancelled. |
| Giữ row Admin gọn nhưng dễ đọc, action dễ tìm. | Thu text và target đến mức vừa bảng bằng mọi giá. |
| Duy trì comfortable/standard/compact density theo role. | Tùy ý đổi padding, row height và control trên từng màn. |
~~~~

## docs/archive/LEGACY_SCAFFOLD.md

~~~~markdown
# Legacy skeleton notes (archived)

These are the original placeholder README contents from the initial full-stack skeleton. They are retained for history only. The current product is a frontend-only prototype; none of these directories implies an active backend, database, API, or TypeScript implementation.

## apps/api/README.md

# API

Backend application container. Recommended structure is domain-module based rather than one large controller/service folder.

## apps/api/src/modules/admin/README.md

# admin

Admin-only orchestration, dashboard summaries and account-issue operations.

## apps/api/src/modules/auth/README.md

# auth

Authentication, session/token handling, login/register and role authorization.

## apps/api/src/modules/availability/README.md

# availability

Tutor available time slots and schedule validation.

## apps/api/src/modules/locations/README.md

# locations

Area/location data used by tutor teaching areas and learner filters.

## apps/api/src/modules/reviews/README.md

# reviews

Post-lesson tutor review creation and admin moderation.

## apps/api/src/modules/sessions/README.md

# sessions

Confirmed tutoring lessons/sessions and completion status. Recommended derived domain.

## apps/api/src/modules/shared/README.md

# shared

Cross-cutting utilities: errors, response format, validation helpers, logging, auth middleware.

## apps/api/src/modules/subjects/README.md

# subjects

Subject catalog CRUD and tutor-subject relationships.

## apps/api/src/modules/tutoring-requests/README.md

# tutoring-requests

Learner -> tutor request lifecycle, statuses, accept/reject and schedule confirmation.

## apps/api/src/modules/tutors/README.md

# tutors

TutorProfile lifecycle and tutor-specific profile data.

## apps/api/src/modules/users/README.md

# users

Base account/profile management for learners/parents and shared user status.

## apps/web/src/app/README.md

# app

Place router configuration, root providers, authentication guards, app shell and global error/loading boundaries here.

## apps/web/src/assets/README.md

# Assets

Local images/icons/illustrations that are part of the product. Avoid storing generated build output here.

## apps/web/src/components/README.md

# Shared Components

Reusable product components belong here, e.g. AppShell, Button, Input, Select, Dialog, Badge, DataTable, Avatar, EmptyState, Pagination, SearchBox and FilterBar.

## apps/web/src/design-system/README.md

# Design System

Store shared tokens/theme definitions and UI primitives here.

Color palette is intentionally TBD. Start with semantic token names (`brand`, `surface`, `text`, `muted`, `success`, `warning`, `danger`, `info`) and map them to actual values only after visual direction is approved.

## apps/web/src/hooks/README.md

# Hooks

Reusable frontend hooks: auth/session, debounced search, pagination, query state, responsive helpers, etc.

## apps/web/src/services/README.md

# Services

API clients and request helpers. Keep network concerns out of visual components.

## apps/web/src/types/README.md

# Types

Shared frontend types/interfaces. Prefer deriving API types from a shared schema later if the stack supports it.

## database/migrations/README.md

# Migrations

Framework-generated or handwritten migrations go here after the database technology is chosen.

## database/README.md

# Database

Database artifacts are separated from application code so schema, migrations and seed data remain reviewable.

## database/schema/README.md

# Schema

Place DBML/SQL/ORM schema definitions here. Start from `docs/data/DATA_MODEL.md` and refine before coding persistence logic.

## database/seeds/README.md

# Seeds

Demo data for subjects, locations, tutor profiles, requests and reviews. Never put real user personal data in seed files.

## scripts/README.md

# Scripts

Development/setup/data scripts belong here after tooling is selected, e.g. seed database, create demo accounts, lint/check or local bootstrap.

## tests/api/README.md

# API Tests

Unit/integration tests for domain services, validation, authorization and request state transitions.

## tests/e2e/README.md

# E2E Tests

Core end-to-end journeys across Learner, Tutor and Admin. Focus on the MVP flows first.

## tests/README.md

# Tests

Test folders are split by layer. Add testing framework configuration after the runtime/framework is selected.

## tests/web/README.md

# Web Tests

Component/integration tests for frontend behavior, forms, role guards and UI states.

## PROJECT_TREE.txt

The original skeleton tree is kept below verbatim. It is not the current project tree.

```text
TutorNearMe_Project_Skeleton/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── modules/
│   │   │       ├── admin/
│   │   │       │   └── README.md
│   │   │       ├── auth/
│   │   │       │   └── README.md
│   │   │       ├── availability/
│   │   │       │   └── README.md
│   │   │       ├── locations/
│   │   │       │   └── README.md
│   │   │       ├── reviews/
│   │   │       │   └── README.md
│   │   │       ├── sessions/
│   │   │       │   └── README.md
│   │   │       ├── shared/
│   │   │       │   └── README.md
│   │   │       ├── subjects/
│   │   │       │   └── README.md
│   │   │       ├── tutoring-requests/
│   │   │       │   └── README.md
│   │   │       ├── tutors/
│   │   │       │   └── README.md
│   │   │       └── users/
│   │   │           └── README.md
│   │   └── README.md
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   └── README.md
│       │   ├── assets/
│       │   │   └── README.md
│       │   ├── components/
│       │   │   └── README.md
│       │   ├── design-system/
│       │   │   └── README.md
│       │   ├── features/
│       │   │   ├── admin/
│       │   │   │   └── DESIGN.md
│       │   │   ├── learner/
│       │   │   │   └── DESIGN.md
│       │   │   └── tutor/
│       │   │       └── DESIGN.md
│       │   ├── hooks/
│       │   │   └── README.md
│       │   ├── services/
│       │   │   └── README.md
│       │   └── types/
│       │       └── README.md
│       └── README.md
├── database/
│   ├── migrations/
│   │   └── README.md
│   ├── schema/
│   │   └── README.md
│   ├── seeds/
│   │   └── README.md
│   └── README.md
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md
│   │   └── ROUTING_AND_ROLES.md
│   ├── data/
│   │   └── DATA_MODEL.md
│   ├── deliverables/
│   │   └── COURSE_DELIVERABLES.md
│   ├── flows/
│   │   ├── ADMIN_FLOW.md
│   │   ├── LEARNER_FLOW.md
│   │   └── TUTOR_FLOW.md
│   ├── planning/
│   │   ├── BACKLOG.md
│   │   └── MVP_SCOPE.md
│   ├── requirements/
│   │   ├── FUNCTIONAL_REQUIREMENTS.md
│   │   └── NON_FUNCTIONAL_REQUIREMENTS.md
│   └── screens/
│       └── SCREEN_INVENTORY.md
├── prompts/
│   ├── 00_MASTER_CONTEXT.md
│   ├── 01_LEARNER_UI_PROMPT.md
│   ├── 02_TUTOR_UI_PROMPT.md
│   ├── 03_ADMIN_UI_PROMPT.md
│   └── 04_VISUAL_QA_PROMPT.md
├── references/
│   ├── FIGMA_REFERENCE.md
│   ├── IE104_Quan_ly_du_an.xlsm
│   ├── SOURCE_SUMMARY.md
│   └── workflow-3-roles.png
├── scripts/
│   └── README.md
├── tests/
│   ├── api/
│   │   └── README.md
│   ├── e2e/
│   │   └── README.md
│   ├── web/
│   │   └── README.md
│   └── README.md
├── .editorconfig
├── .gitignore
├── AGENTS.md
├── DESIGN.md
├── PROJECT_BRIEF.md
└── README.md
```
~~~~

## prompts/00_MASTER_CONTEXT.md

~~~~markdown
# Prompt 00 – Master Context

Dùng prompt này trước khi bắt đầu bất kỳ role UI nào.

```text
You are working on TutorNearMe, a hyperlocal student-tutor matching website.

Read PROJECT_BRIEF.md, DESIGN.md, docs/planning/MVP_SCOPE.md,
docs/screens/SCREEN_INVENTORY.md, and AGENTS.md before making changes.

The existing Figma is primarily a structural/layout reference.
Do not treat its current color palette as final.

Maintain one shared design foundation across Learner, Tutor, and Admin,
while allowing each role to have different information density and emphasis.

Do not generate the entire product in one giant component.
Build reusable design primitives first and role features second.

Before coding, summarize:
1. the screens you will touch,
2. the shared components needed,
3. the route/data dependencies,
4. what belongs to MVP versus later scope.
```
~~~~

## prompts/01_LEARNER_UI_PROMPT.md

~~~~markdown
# Prompt 01 – Learner / Parent UI

```text
Implement the Learner / Parent flow only.

Read:
- docs/flows/LEARNER_FLOW.md
- apps/web/src/features/learner/DESIGN.md
- docs/screens/SCREEN_INVENTORY.md

Primary journey:
Register/Login -> Tutor Search -> Filter -> Tutor Detail -> Send Request
-> Track Request -> Lesson Detail -> Review Tutor.

The experience should be approachable, trustworthy, discovery-oriented and calm.
Search, filters, tutor information, availability, price and request CTA must be easy to scan.

Use the shared design system. Do not create learner-only versions of shared Button,
Input, Modal, Badge or Form primitives unless there is a real behavior difference.

Do not copy the old Figma palette automatically.
Preserve useful layout/hierarchy patterns, then apply the approved new palette.

Implement representative screens first and visually verify them before expanding.
```
~~~~

## prompts/02_TUTOR_UI_PROMPT.md

~~~~markdown
# Prompt 02 – Tutor UI

```text
Implement the Tutor flow only.

Read:
- docs/flows/TUTOR_FLOW.md
- apps/web/src/features/tutor/DESIGN.md
- docs/screens/SCREEN_INVENTORY.md

Primary journey:
Register/Login -> Create/Edit Profile -> Subjects -> Pricing -> Locations
-> Availability -> Incoming Requests -> Accept/Reject -> Schedule -> Complete Lesson.

The experience should feel professional, organized, schedule-driven and efficient.
Prioritize status clarity, calendar/availability editing, request details and next actions.

Reuse the shared design system and preserve brand consistency with Learner UI.
Do not redesign the application independently.
```
~~~~

## prompts/03_ADMIN_UI_PROMPT.md

~~~~markdown
# Prompt 03 – Admin UI

```text
Implement the Admin flow only.

Read:
- docs/flows/ADMIN_FLOW.md
- apps/web/src/features/admin/DESIGN.md
- docs/screens/SCREEN_INVENTORY.md

Core journey:
Admin Login -> Dashboard -> Users -> Tutors -> Subjects -> Reviews -> Account Issues.

Admin UI should prioritize information density, quick scanning and operational efficiency.
Use tables, filters, status badges and clear actions. Avoid decorative UI that reduces density.

Treat the current admin Figma as a layout/reference source, not a final color system.
Reuse shared primitives and semantic status tokens.

Do not implement later Figma-only screens unless requested or the MVP is complete.
```
~~~~

## prompts/04_VISUAL_QA_PROMPT.md

~~~~markdown
# Prompt 04 – Visual QA

```text
Perform visual QA on the currently implemented role flow.

Do not add new features.

Check:
- layout hierarchy against the approved reference,
- consistent typography,
- spacing rhythm,
- semantic colors,
- icon consistency,
- hover/focus/disabled/loading/error/empty states,
- desktop/tablet/mobile responsiveness,
- table overflow,
- form alignment,
- repeated components that should be shared.

Run the app, inspect rendered screens, and fix visible mismatches.
Do not declare completion before visual verification.
```
~~~~

## references/SOURCE_SUMMARY.md

~~~~markdown
# Source Summary

## Nguồn 1 – File quản lý đề tài

File: `IE104_Quan_ly_du_an.xlsm`

Sheet: `2_Goi_y_de_tai`

Đề tài: STT 4 – `TutorNearMe – Gia sư sinh viên hyperlocal`

Thông tin chính đã được đưa vào `PROJECT_BRIEF.md`.

Google Drive URL gốc:
https://docs.google.com/spreadsheets/d/1oGQ0ZR9oTIpDFqdmPBf0LzaFDlwbgHy9/edit?gid=698143046#gid=698143046

## Nguồn 2 – Sơ đồ luồng 3 vai trò

Ảnh được lưu tại `workflow-3-roles.png` trong cùng thư mục `references/`.

## Nguồn 3 – Figma

Xem `FIGMA_REFERENCE.md`.
~~~~

## references/FIGMA_REFERENCE.md

~~~~markdown
# Figma Reference

Link đã dùng trong quá trình trao đổi:

https://www.figma.com/design/1moupOCQHM6eiB7jUgUk6S/UI_Web?node-id=0-1&t=fImKdVKi6IxMeIEs-0

## Cách sử dụng

- Ưu tiên bố cục, grouping, hierarchy và pattern màn hình.
- Không khóa bảng màu hiện tại.
- Khi code từ Figma, chuyển absolute layout thành Flex/Grid/responsive structure.
- Những màn hiện chưa có trong Figma phải kế thừa shared design system và screen inventory.
~~~~
