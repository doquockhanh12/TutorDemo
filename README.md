# TutorNearMe

TutorNearMe là prototype tương tác để tìm gia sư sinh viên theo môn học, khu vực, lịch rảnh và mức phí. Ba trải nghiệm **Người học/Phụ huynh**, **Gia sư** và **Admin** dùng chung thương hiệu nhưng có layout riêng. Project hiện **frontend-only**: dữ liệu mock và localStorage, không có backend, API thật hay database.

## Chạy ứng dụng

```sh
cd apps/web
npm install
npm run dev
```

Mở URL Vite in ra terminal. Kiểm tra production build bằng `npm run build` trong `apps/web`. Stack: **React, JavaScript, Vite, React Router, CSS thuần, Lucide**; Nunito/Nunito Sans được self-host bằng Fontsource với glyph tiếng Việt.

## Route đang có

| Khu vực | Route |
|---|---|
| Public | `/` trang chủ; `/learner` landing Người học; `/tutor` landing tuyển gia sư (**không phải** dashboard) |
| Người học | `/learner/search`, `/tutors/:id`, `/requests/new`, `/requests`, `/requests/:id` |
| Gia sư | `/tutor/dashboard`, `/tutor/profile`, `/tutor/availability`, `/tutor/requests`, `/tutor/requests/:id`, `/tutor/lessons` |
| Admin | `/admin/dashboard` |

Hồ sơ nhanh trong màn tìm kiếm chuyển sang form yêu cầu đầy đủ. Hồ sơ đã lưu và một số thao tác demo được giữ trong localStorage qua route/reload; bộ lọc landing chỉ giữ trong local state. Các route còn thiếu được liệt kê trong [`SCREEN_INVENTORY.md`](docs/screens/SCREEN_INVENTORY.md), không được xem là đã triển khai. Trang workspace có thanh chuyển nhanh giữa các role để review prototype.

## Cấu trúc hiện hành

```text
apps/web/
  src/App.jsx, src/main.jsx       routing và entry point
  src/components/                 UI primitives dùng chung
  src/data/                       mock data, một nguồn hồ sơ gia sư
  src/features/public/            ba landing, header/footer và public UI
  src/features/learner/           tìm kiếm và luồng yêu cầu của người học
  src/features/tutor/             dashboard và công việc gia sư
  src/features/admin/             giao diện vận hành Admin
  src/hooks/                      dialog focus và local demo persistence
  src/styles/                     semantic tokens, reset, global, shared flows
```

Sáu hồ sơ gia sư gốc ở `src/data/tutors.js`; `src/data/public.js` chuyển chúng sang dạng hiển thị landing. Không có code ứng dụng đang hoạt động trong skeleton API/database cũ.

## Tài liệu cần đọc

1. [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md): đề bài và nguồn gốc yêu cầu.
2. [`DESIGN.md`](DESIGN.md): visual foundation hiện hành. `reference/final/` là visual source cao nhất và được giữ nguyên; `reference/figma/` chứa export cấu trúc, `reference/brief/` chứa nguồn đề bài.
3. [`PRODUCT_SPEC.md`](docs/planning/PRODUCT_SPEC.md): phạm vi prototype, yêu cầu, flow và backlog.
4. [`SCREEN_INVENTORY.md`](docs/screens/SCREEN_INVENTORY.md): ID màn hình cần giữ ổn định.
5. [`FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md): bằng chứng Figma cho bố cục, hierarchy và navigation; palette Figma không phải final.
6. [`ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md): ranh giới frontend và route hiện tại.

Các prompt, đặc tả visual xanh rêu và ghi chú scaffold cũ được bảo tồn **nguyên văn** tại [`PROJECT_HISTORY.md`](docs/archive/PROJECT_HISTORY.md). Đây là tư liệu lịch sử, không phải hướng dẫn triển khai hiện hành.
