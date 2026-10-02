# TutorNearMe — Preserved Figma Analysis for Codex

## Evidence labels

Use these labels to distinguish what each finding is based on:

- `DIRECT_FIGMA_MCP` — returned by read-only Figma MCP metadata, screenshot, or inspection calls.
- `EXPORTED_FIGMA_IMAGE` — visually observed in user-provided Figma exports; exact node IDs and frame dimensions are not implied unless stated.
- `PROJECT_DOCS` — stated in the repository brief, flows, inventory, or design guidance.
- `UNKNOWN` — not established by the available evidence. Do not infer it from neighboring screens or names.

Existing Admin findings below are `DIRECT_FIGMA_MCP`. Learner and Tutor visual findings in the following sections are `EXPORTED_FIGMA_IMAGE`; project-scope comparisons are `PROJECT_DOCS`.

> Scope: frontend-only interactive prototype.

> Persistence rule: this file is intended to preserve Figma findings across Codex sessions.
> Codex should read this file before any future UI/design work and should not rely on session memory alone.
> If new Figma evidence is obtained later, append or revise this file with source/confidence notes instead of replacing verified findings silently.

> Source priority for this document:
> 1. `DIRECT_FIGMA_MCP` for page IDs, confirmed frame names/dimensions, and measured Admin styles.
> 2. `EXPORTED_FIGMA_IMAGE` for visual compositions and details not preserved by the metadata reads.
> 3. `PROJECT_DOCS` for intended flows, screen IDs, and constraints.
> 4. `UNKNOWN` for anything not established by these sources; do not infer it.
>
> Important: the existing Figma is a **structural reference**, not a final visual specification.
> Preserve layout hierarchy, information grouping, navigation patterns, and useful interaction patterns.
> Do **not** treat current colors, typography, icon placeholders, decoration, or exact pixel dimensions as locked.

---

## 1. Overall design model

TutorNearMe currently has three distinct role experiences:

- **Learner / Parent**: discovery-oriented, public/consumer-facing, top navigation, search/filter, tutor comparison, tutor detail, request tracking.
- **Tutor**: operational workspace, persistent left sidebar + topbar, dashboard, requests, calendar, availability, students/subjects.
- **Admin**: operational/data-heavy workspace, persistent sidebar/topbar, tables, review/approval/status workflows.

The three areas should share one brand foundation, but their density and emphasis should differ:

- Learner: warmer, more spacious, persuasive and approachable.
- Tutor: more structured, task-oriented and schedule-driven.
- Admin: denser, more utilitarian and scan-oriented.

---


# Admin — preserved from prior Codex Figma MCP read

> Source: prior Codex session output that successfully read the Admin page through Figma MCP before Starter-plan quota was exhausted.
> Confidence: direct Figma metadata read for Admin.
> Important: do not call Figma MCP again just to reproduce this information.

## Confirmed Admin page

Page:
- `Admin`
- node-id: `0-1`

Confirmed top-level frames: **6**

1. `Flow3/Admin/Dashboard` — 1440 × 1120
2. `Flow3/3F Tutor Approval Detail` — 1440 × 1080
3. `Flow3/3G Live Classes` — 1440 × 1080
4. `Flow3/3H Review Moderation` — 1440 × 1080
5. `Flow3/3I Reports Complaints` — 1440 × 1080
6. `Flow3/3J Suspended Requests Ticket` — 1440 × 1080

## Admin navigation and layout

Observed shell:
- persistent topbar;
- persistent left sidebar;
- desktop-oriented admin workspace.

Dashboard structure:
- metric/stat cards at the top;
- lower operational area split into multiple management/monitoring regions;
- pending tutor approval table;
- live classes;
- reviews;
- reports/complaints;
- suspended/stuck requests.

Operational screens use:
- tables;
- filters above tables;
- status badges;
- row-level actions;
- detail panels for profile/report/ticket contexts;
- notes/history/action areas.

Patterns worth preserving:
- admin sidebar/topbar shell;
- page title + short description;
- filters before data tables;
- status badge system;
- metric/stat cards;
- detail panel;
- actions placed near the relevant record/entity.

## Admin typography / spacing / radius / palette from metadata

Observed directly from Admin metadata:

### Typography
- IBM Plex Sans.
- Font sizes around 9, 10 and 11px appeared frequently.
- Larger page/title text up to roughly 30px.
- Table/body text is notably smaller than headings.

### Layout / spacing
- Desktop canvas width: 1440px.
- Dashboard topbar: about 64px high.
- Dashboard sidebar: about 198px wide.
- Other Admin screens: sidebar about 205px wide.
- Dashboard panel padding around 14px.
- Table row height around 48px.

### Radius
Observed values:
- 8px
- 9px
- 10px
- 12px
- 14px
- pill badges around 999px

### Palette
Observed examples:
- light gray / white backgrounds;
- primary text near `#111827` / `#1F2937`;
- secondary text near `#4B5563` / `#64748B`;
- borders / neutral fills near `#E5E7EB` / `#F3F4F6`;
- semantic red near `#EF4444`;
- semantic green near `#16A34A`;
- semantic blue near `#2563EB`;
- corresponding soft/tinted semantic backgrounds.

These colors are **not final** and must not be treated as the definitive TutorNearMe palette.

### Iconography
Observed:
- punctuation/glyph-style icons;
- dots;
- `!`;
- stars;
- arrows;
- emoji-like location/calendar markers;
- initial-based avatars.

The prior metadata did not show a strong reusable vector/component icon system. Treat this as placeholder-quality iconography.

## Admin inconsistencies / redesign opportunities

Known inconsistencies:
- sidebar width differs: ~198px on Dashboard vs ~205px on other screens;
- topbar search placement/width differs between Dashboard and operational screens;
- icon language is inconsistent;
- 9–11px table text is likely too small for comfortable desktop reading;
- static demo data dominates the existing frames;
- responsive behavior is not demonstrated.

Do not preserve these inconsistencies.

## Admin comparison with screen inventory

Confirmed or partially represented:
- A02 Dashboard
- A06 Tutor Detail / Tutor Approval Detail — partial/related
- A08 Review Management / Moderation
- A09/A10 Account Issues / Suspended Requests / Issue Detail — related
- A12 Reports / Complaints — represented even though inventory may classify it as Later
- Live Classes exists in Figma but has no exact one-to-one inventory item

Not confirmed from the Admin Figma read:
- A01 Admin Login
- A03 User List
- A04 User Detail / Account Status
- A05 Tutor List
- A07 Subject Management
- A11 Location Management
- A13 System Settings
- A14 Logs / Permissions

Do not interpret "not confirmed" as "definitely absent from the original file"; it only means they were not in the 6 confirmed top-level Admin frames from the successful read.

## Admin design DNA

Admin provides a strong reference for:
- dense information layout;
- dashboard metrics;
- data tables;
- filters;
- status badges;
- approval/moderation workflows;
- issue/ticket detail;
- clear row-level actions.

When designing missing Admin screens:
- reuse the Admin shell;
- preserve dense, scan-oriented information hierarchy;
- reuse table/filter/status/detail patterns;
- improve typography size, icon consistency, spacing consistency and responsive behavior;
- do not copy the old palette blindly.

---


# 2. Learner / Parent — directly observed from exported Figma

## 2.1 Confirmed screens / states visible in the export

At least four major desktop compositions are visible:

### L-A. Tutor Search / Discovery — compact filter toolbar
Main structure:

1. Global header
2. Hero / introductory banner
3. Horizontal filter toolbar
4. Search result count / sort control
5. Tutor result cards
6. Right-side supporting cards
7. Footer

The result area uses:
- one larger featured tutor card;
- smaller tutor cards below;
- rating, subjects, location, availability, price and CTA;
- supporting right column for:
  - nearby tutor visualization / proximity-like illustration;
  - quick request CTA;
  - trust / support information.

### L-B. Tutor Profile Detail + Create Request
Main structure:

1. Global header
2. Breadcrumb / context line
3. Main two-column layout

Left/main column:
- tutor identity summary;
- price;
- save/contact-like action;
- introduction;
- subjects / skill tags;
- weekly availability table/grid;
- teaching area chips/tags.

Right column:
- `Gửi yêu cầu học` form;
- subject;
- proposed time;
- lesson/session information;
- message/note;
- primary CTA;
- recent reviews / rating summary below.

This is a strong structural pattern to preserve:
**profile information + availability on the left, conversion/action panel on the right**.

### L-C. My Requests / Request Tracking
Main structure:

1. Global header
2. Page title `Yêu cầu học của bạn`
3. Status tabs/chips
4. Vertical request cards
5. Inline actions by state
6. Review area for completed lesson/request

Visible status ideas include:
- pending;
- accepted/confirmed;
- completed / review-related state;
- rejected/cancelled-like negative state.

A completed request exposes rating controls and a review input/CTA.

### L-D. Tutor Search / Discovery — detailed sidebar filters
This is a denser variant of the search page.

Structure:
- same global header and hero;
- left filter sidebar;
- center result cards;
- right supporting cards.

The sidebar includes grouped filter sections such as:
- subjects;
- area/location;
- schedule;
- fee / budget.

This is useful as the **desktop expanded-filter pattern**.

---

## 2.2 Learner navigation pattern

The Learner experience uses a **horizontal top navigation**, visually closer to a consumer marketplace than an internal dashboard.

Observed navigation concepts:
- Find tutor
- About / introduction
- Parent-focused information
- Become a tutor
- location indicator
- Login
- Register

Structural recommendation:
- preserve top navigation for public/discovery pages;
- do not replace it with the Tutor/Admin sidebar pattern.

---

## 2.3 Learner layout DNA worth preserving

### Search page
Preserve:
- hero before search results;
- strong filter/search area directly beneath hero;
- comparison-friendly tutor cards;
- sort control near result count;
- support/assurance content in secondary column;
- optional expanded filter sidebar on desktop.

### Tutor detail
Preserve:
- tutor summary at top;
- introduction before deep details;
- subjects as compact tags;
- availability as a visible grid;
- request form in a dedicated side panel;
- reviews close to the decision/request area.

### Requests
Preserve:
- state-driven cards;
- status chips/tabs;
- actions inside the relevant request card;
- review exposed only when appropriate for the prototype state.

---

## 2.4 Learner visual characteristics currently present

Observed visual language:
- warm cream / beige page sections;
- coral/orange primary CTA;
- pale green/mint support surfaces;
- white cards;
- dark neutral text;
- rounded rectangles;
- thin gray borders;
- compact status tags.

Typography appears to mix:
- a **serif/display-style heading** in the Learner hero;
- sans-serif UI/body/navigation text.

Do not infer exact font family from the export.

Important:
The current palette is **not final**. It is useful only to understand that the Learner experience was intended to feel warmer than Tutor/Admin.

---

## 2.5 Learner design weaknesses / redesign opportunities

Do not reproduce these blindly:

- Some UI copy and metadata are very small for desktop.
- Tutor cards contain many competing pieces of metadata.
- Multiple colored tags can create visual noise.
- The right support column can feel fragmented because several small cards compete for attention.
- Search has two variants; their relationship should be formalized:
  - compact toolbar;
  - expanded sidebar.
- Iconography is inconsistent / placeholder-like.
- Many cards use similar border/radius treatment, which can flatten visual hierarchy.
- Exact palette should be redesigned.
- Responsive behavior is not demonstrated by this export.

---

# 3. Tutor — directly observed from exported Figma

## 3.1 Confirmed screens / states visible in the export

Four major desktop screens are visible:

### T-A. Tutor Dashboard / Overview
Shell:
- left persistent sidebar;
- top search bar / topbar;
- account area in top-right;
- main dashboard canvas.

Main content:
- greeting / tutor name;
- summary metric cards;
- current/pending tutoring requests;
- upcoming lessons;
- weekly availability mini-grid;
- tutor profile/completion card;
- monthly income summary;
- quick actions.

This establishes the Tutor product as an **operational dashboard**, not a marketing interface.

### T-B. Availability Calendar
Page title: `Lịch rảnh của tôi`

Structure:
- Tutor sidebar;
- topbar;
- week selector;
- primary action to edit/update schedule;
- large weekly time-grid.

The grid appears optimized for:
- weekday columns;
- time rows;
- available slots;
- unavailable / neutral slots.

This should become a reusable scheduling component.

### T-C. Weekly Teaching Schedule
Page title: `Lịch dạy tuần này`

Structure is similar to Availability Calendar but used for actual lessons.

The weekly grid includes visually distinct lesson blocks/states, using multiple semantic colors.

Important:
Availability and Teaching Schedule should share the **same calendar geometry**, while using different content/state rules.

### T-D. Subject / Student Detail
Page title shows a subject, e.g. `Toán`.

Structure:
- summary metric cards;
- list of learners/students;
- status/action per learner;
- subject history / recent history section.

This screen suggests a relationship:
**Subject → associated learners → lesson/progress/status information**.

---

## 3.2 Tutor navigation pattern

Tutor uses a persistent **left sidebar** plus a compact topbar.

Visible sidebar concepts include:
- Overview
- Requests
- Schedule
- Availability
- Students
- Subjects
- Income
- Profile
- Reviews
- Messages
- Settings

Structural recommendation:
- preserve the sidebar navigation model;
- keep scheduling-related items adjacent;
- maintain a clear active state;
- avoid mixing public Learner navigation into Tutor workspace.

---

## 3.3 Tutor layout DNA worth preserving

Preserve:

### Dashboard
- greeting + summary metrics first;
- pending work near top;
- upcoming schedule visible without deep navigation;
- availability snapshot;
- earnings/profile/quick actions as supporting modules.

### Scheduling
- consistent week-switching control;
- large calendar grid;
- fixed weekday/time geometry;
- distinct availability vs lesson state styling;
- clear primary action.

### Subject/student detail
- summary metrics above;
- learner list as primary content;
- status/actions embedded at row/card level;
- history separated below.

---

## 3.4 Tutor visual characteristics currently present

Observed visual language:
- white / very light gray surfaces;
- blue as dominant interactive/primary color;
- light blue selected sidebar state;
- green/orange/purple used for calendar semantics;
- compact borders and cards;
- mostly sans-serif UI typography;
- low-decoration, productivity-oriented layout.

Again, the current blue palette is **not final**.

It is more important to preserve:
- clear operational structure;
- schedule readability;
- information hierarchy;
- density appropriate for repeated daily use.

---

## 3.5 Tutor design weaknesses / redesign opportunities

Do not reproduce blindly:

- Text is frequently very small.
- Dashboard contains many similarly weighted cards.
- Metric cards, requests, schedule, availability and income can compete for visual priority.
- Calendar cells are dense; interactive states need stronger hierarchy.
- Semantic schedule colors need a consistent system and accessible contrast.
- Sidebar iconography appears minimal/placeholder-like.
- Topbar/account area feels visually underdeveloped compared with the main content.
- Some screens leave large open regions after the main functional content; layout should adapt better to viewport height/width.
- Responsive behavior is not demonstrated.

---

# 4. Learner vs Tutor — confirmed structural differences

Do NOT force both roles into one identical page shell.

## Learner
Use:
- top navigation;
- consumer marketplace layout;
- hero/search/discovery;
- comparison cards;
- trust/support content;
- stronger visual storytelling.

## Tutor
Use:
- persistent sidebar;
- operational topbar;
- dashboards;
- schedules/calendars;
- task/status driven surfaces;
- less decorative content.

They should share:
- brand identity;
- typography family/system;
- spacing scale;
- button language;
- form controls;
- badges;
- focus/hover behavior;
- icon family;
- semantic status logic.

---

# 5. Shared reusable components inferred from both exports

Codex should plan for reusable frontend primitives/patterns such as:

- Brand logo/header treatment
- Primary / secondary / ghost button
- Input / select / search field
- Status badge / pill
- Subject tag
- Location tag
- Price display
- Avatar
- Rating display
- Tutor card
- Metric/stat card
- Empty/support/info card
- Filter group
- Filter sidebar
- Request card
- Review input/rating control
- Week selector
- Calendar/time-grid
- Calendar slot
- User/account menu
- Sidebar item
- Page header
- Section header
- Modal / dialog for prototype interactions

Do not build all of them immediately; identify shared patterns before implementing role-specific screens.

---

# 6. Screen inventory implications

## Learner screens confirmed or partially represented by export

Confirmed/represented:
- Tutor Search / Discovery
- Search Filters
- Tutor Profile Detail
- Create Tutoring Request
- My Requests
- Request Detail / Status pattern
- Lesson/review-related state
- Submit Tutor Review pattern

Not visible in this export and therefore **not confirmed from Figma image**:
- Login
- Register
- Request Confirmation as a dedicated screen
- Learner Account/Profile
- any dedicated notification/settings screens

Do not claim these are absent from the full Figma file; only that they are not present in this export.

## Tutor screens confirmed or partially represented by export

Confirmed/represented:
- Dashboard
- Availability Calendar
- Weekly/Confirmed Schedule
- Subject/Student Detail
- Incoming Requests pattern on dashboard
- lesson/status scheduling pattern
- earnings/profile summary patterns

Not visible in this export and therefore **not confirmed from Figma image**:
- Login
- Register / onboarding
- Edit Tutor Profile as a full screen
- Pricing Settings as a full screen
- Teaching Location Settings
- Incoming Requests full list
- Request Detail full screen
- Accept/Reject dedicated state screen
- Lesson Detail as a dedicated screen
- Review management full screen
- Messages full screen
- Settings full screen

Sidebar labels may reference some of these areas, but a navigation label is not proof that a full screen was designed.

---

# 7. What must be kept from current Figma

Treat the following as high-value structural reference:

1. Role-specific navigation model.
2. Overall information hierarchy.
3. Section order.
4. Main-vs-secondary column relationships.
5. Tutor comparison structure.
6. Tutor profile + request panel split.
7. State-driven request cards.
8. Tutor dashboard information grouping.
9. Weekly calendar geometry.
10. Filter-before-results pattern.
11. Status/CTA placement close to the related entity.
12. Desktop information density differences between Learner and Tutor.

---

# 8. What Codex is allowed and encouraged to redesign

Codex may redesign:

- complete color palette;
- exact typography;
- icon set;
- shadows;
- borders;
- border radius;
- exact spacing values;
- card styling;
- decorative surfaces;
- illustrations;
- visual treatment of status chips;
- input appearance;
- exact sidebar/header dimensions;
- micro-interactions;
- hover/focus states;
- responsive behavior.

It may also simplify visual clutter where current Figma has too many equally weighted cards/tags.

However, redesign must not remove important information or change the functional hierarchy without a reason documented in the implementation.

---

# 9. Visual direction constraints

The final implementation should avoid generic AI/SaaS styling.

Avoid defaulting to:
- purple/blue gradient SaaS look;
- glassmorphism;
- every section inside a rounded card;
- oversized marketing typography everywhere;
- heavy shadows;
- random gradient backgrounds;
- generic unmodified component-library appearance;
- excessive badges/colors.

Prefer:
- distinct TutorNearMe identity;
- educational but not childish;
- trustworthy;
- approachable for Learner/Parent;
- professional for Tutor;
- operational and clear for Admin;
- strong typography hierarchy;
- deliberate spacing;
- accessible color contrast;
- one coherent icon family;
- clear semantic states.

---

# 10. Responsive interpretation

The exported Figma screens are desktop references.

Do not translate absolute Figma coordinates directly into CSS.

Implementation should use:
- responsive containers;
- CSS Grid / Flexbox;
- reusable layout primitives;
- breakpoint-aware navigation;
- content reflow rather than simple scaling.

Expected behavior:

### Learner
Desktop:
- multi-column search/result layout.

Tablet:
- reduce supporting column;
- filters may become drawer/sheet.

Mobile:
- stacked tutor cards;
- filter sheet/modal;
- request panel becomes inline/full-width.

### Tutor
Desktop:
- persistent sidebar + full calendar.

Tablet:
- collapsible sidebar;
- reduced dashboard columns.

Mobile:
- drawer/bottom navigation as appropriate;
- calendar should switch to a readable day/agenda or horizontally scrollable representation rather than shrinking text to unreadable size.

---

# 11. Frontend-only prototype rules

Current project scope is frontend-only.

Use:
- mock data;
- local state;
- prototype navigation;
- mock status transitions.

Do NOT design or implement:
- real database;
- ORM;
- backend API;
- server auth;
- server authorization;
- migrations;
- transaction logic.

Example prototype transitions are acceptable:
- Learner request: pending → cancelled.
- Tutor request: pending → accepted/rejected.
- Accepted request may expose a confirmed lesson in mock state.
- Tutor lesson: confirmed → completed.
- Completed lesson may expose Learner review UI.

These transitions are for UI demonstration only, not final backend business rules.

---

# 12. Instructions for missing screens

When generating a missing screen:

1. Identify which role owns it.
2. Reuse that role's shell/navigation.
3. Reuse the closest existing structural pattern.
4. Preserve the information hierarchy from project requirements.
5. Do not invent unnecessary functionality.
6. Use mock content realistic enough to demonstrate states.
7. Keep visual language consistent with the selected final design system.
8. Do not copy placeholder styling/glyphs from Figma.
9. Include loading/empty/error states where useful for UI completeness.
10. Ensure desktop structure can reasonably collapse to tablet/mobile.

Examples:

- Missing Learner screen → derive from Learner header, content width, form/card language.
- Missing Tutor screen → derive from Tutor sidebar/topbar, page header, dashboard/list/calendar patterns.
- Missing Admin screen → derive from the existing Admin table/detail/status patterns already analyzed in the project.

---

# 13. Source-confidence note

The Learner and Tutor conclusions above come directly from the two exported Figma images supplied by the user.

This document does **not** claim:
- exact font family where it cannot be read reliably;
- exact spacing tokens;
- exact hex colors;
- that screens not visible in the exports are absent from the original Figma file.

For exact inventory of unseen frames, rely on a later export or Figma MCP if quota becomes available.

---

# 14. Recommended next Codex step

Do **not** start application implementation yet.

Next task:

1. Read this document.
2. Read `DESIGN.md`.
3. Read the Learner/Tutor/Admin flow docs and screen inventory.
4. Propose **three distinct visual directions** for the shared TutorNearMe design system.
5. Each direction must explain how the same system adapts to:
   - Learner / Parent
   - Tutor
   - Admin
6. Do not select a winner automatically.
7. Do not write application code until the user approves a visual direction.

---

# 15. Additional direct Figma MCP findings preserved from the current session

> Source: `DIRECT_FIGMA_MCP` — read-only metadata and inspection results already returned in the current session. No Figma MCP calls should be repeated solely to recover these facts. The MCP Starter-plan call limit was reached afterward.

## 15.1 Actual page names and IDs

The page ID mapping returned by Figma MCP is:

| Page node ID | Actual page name |
|---|---|
| `0:1` | `Admin` |
| `20:2` | `Learner / Parent` |
| `20:280` | `Tutor` |

The Tutor and Learner links used in a prior request had these two page IDs assigned to the opposite role labels. Use the actual page names above when matching an export or inventory.

## 15.2 Learner / Parent metadata

The following top-level frame was directly returned by metadata:

- Node ID `20:3` — `Flow1/Search/Desktop` — **1440 × 1900**.

Metadata for this frame also directly confirmed:

- `Header`: 1440 × 78.
- `Hero`: x=40, y=100, 1360 × 250.
- `SearchToolbar`: x=40, y=374, 1360 × 80.
- `Results`: x=300, y=478, 720 × 1220.
- A featured tutor card and compact tutor cards are nested in the result area; the featured card is 650 × 270 and compact cards are 310 × 300.
- Search controls include subject, location, availability, fee, additional filters, and a tutor-search action.
- Tutor card content includes identity, school/experience, rating, subjects, area/distance, completed lessons, verification label, availability, fee, save, and detail actions.

These are Figma canvas measurements and hierarchy observations, not approved implementation dimensions. The complete top-level frame count and names for the Learner / Parent page are `UNKNOWN` in the preserved session output.

Inventory comparison (`PROJECT_DOCS`): this frame represents L03 Tutor Search / Discovery and part of L04 Search Filters. The metadata does not confirm separate profile, request, tracking, lesson, or review frames.

## 15.3 Tutor metadata

The following top-level frame was directly returned by metadata:

- Node ID `22:2682` — `Flow2/2E Subject + Session Detail` — **1440 × 1080**.

Metadata for this frame directly confirmed:

- `Topbar`: 1440 × 66.
- `Sidebar`: x=0, y=66, 205 × 1014.
- Sidebar labels include Overview, Requests, Schedule, Availability, Students, Income, Tutor Profile, Reviews, Messages, and Settings.
- The content is a subject detail view with summary metrics, learner/student cards, lesson status/actions, and subject history.
- Three learner cards are each 1100 × 146; the subject-history panel is 1100 × 130.

Tutor page metadata also exposed a weekly calendar grid with weekday headers, ten lesson/time periods, and labels including confirmed, upcoming, and awaiting confirmation. Its exact top-level frame name, node ID, and dimensions are `UNKNOWN` in the preserved session output. The complete top-level frame count and names for the Tutor page are also `UNKNOWN` here.

Inventory comparison (`PROJECT_DOCS`): `Flow2/2E Subject + Session Detail` partially represents T13 Lesson Detail and T14 Mark Lesson Completed because it shows lesson status and a completion action inside a subject/student view. It is not evidence of a standalone T13 or T14 frame. The weekly calendar metadata supports schedule-related screens, but the exact frame-to-inventory mapping remains `UNKNOWN`.

## 15.4 Additional Admin screen details from direct MCP screenshots

The following details were visible in read-only screenshots returned by Figma MCP for the six Admin frames (`DIRECT_FIGMA_MCP`):

- **Dashboard:** global search includes a `⌘ K` shortcut badge. Dashboard sections include pending tutor approvals, currently running lessons, review moderation, recent reports/complaints, and stuck requests; summary metrics appear in a lower row.
- **Tutor Approval Detail:** verification checklist for matching personal information, student-card clarity, valid school/major, and subjects matching ability; evidence preview; submitted subjects, areas, proposed fee, and profile description; action history; approve/reject controls and a rejection-reason field.
- **Live Classes:** filters for subject, area, and format; table columns for subject, tutor, learner, start time, duration, format, and status. A note calls for a small dot alongside the `Đang diễn ra` badge.
- **Review Moderation:** filters for rating and status; table columns for learner, tutor, stars, content, date, and status; review-detail modal with approve, hide, reject, and reason entry.
- **Reports / Complaints:** filters for report type, status, and date range; table with report ID, type, sender, related person, and status; detail panel with description, evidence, related history, internal admin note, and warn/suspend/reject actions.
- **Suspended Requests Ticket:** table with request ID, issue type, related user, hold reason, creation date, and status; detail area with priority, account, hold reason/time, conversation history, reply field, and unlock/continue-hold/close-ticket actions.

These are the screen contents shown in the retrieved images; they do not establish implemented behavior or a final business workflow.

## 15.5 Additional measured Admin metadata

Read-only inspection of the six confirmed Admin frames returned 352 `FRAME` nodes and 517 `TEXT` nodes. No vector or component node types appeared in that inspected hierarchy. This supports the finding that the current Admin icon treatment is largely glyph/text based; it does not prove the file has no components elsewhere.

The 517 text nodes used IBM Plex Sans. Observed size counts included:

- 9px: 170 text nodes
- 10px: 106 text nodes
- 11px: 168 text nodes
- Other observed sizes: 8, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 26, 28, and 30px

Observed solid-fill samples in the inspected Admin frames included:

- Neutrals: `#F9FAFB`, `#FFFFFF`, `#F6F7F9`, `#F3F4F6`, `#E5E7EB`, `#6B7280`, `#64748B`, `#4B5563`, `#1F2937`, `#111827`
- Semantic examples: `#FEF2F2` / `#EF4444`, `#ECFDF3` / `#16A34A`, and `#EFF6FF` / `#2563EB`

Observed corner-radius values included 0, 5, 8, 9, 10, 12, 14, 16, and 999px. The 999px value corresponds to pill-like elements. These are measured instances, not a final token scale.

## 15.6 Evidence limits

- `DIRECT_FIGMA_MCP`: Admin top-level frame inventory and measured Admin styles above; Learner search frame `20:3`; Tutor subject/session frame `22:2682`; page ID/name mapping.
- `EXPORTED_FIGMA_IMAGE`: the broader Learner and Tutor compositions, states, and visual characteristics described in Sections 2 and 3.
- `PROJECT_DOCS`: intended flows, MVP scope, and screen IDs described in Sections 6 and 12.
- `UNKNOWN`: complete Learner and Tutor top-level frame inventories were not preserved in the session output. Do not promote exported-image screen labels into exact Figma frame names or node IDs.
