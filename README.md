# TutorNearMe

Prototype frontend kết nối Người học/Phụ huynh với gia sư sinh viên theo môn, khu vực, lịch rảnh và mức phí. React + JavaScript + Vite + React Router + CSS thuần + Lucide; Nunito/Nunito Sans self-host qua Fontsource. Không có backend, API thật hoặc database.

## Chạy app

```sh
cd apps/web
npm install
npm run dev
```

Chạy `npm run build` tại `apps/web` để build production.

## Route và tài khoản demo

| Khu vực | Entry |
|---|---|
| Public | `/`, `/learner`, `/tutor` |
| Auth | Shared `/login`, `/register`, `/tutor/register` |
| Learner | `/learner/search`, `/learner/dashboard`, `/learner/map`, `/tutors/:id`, `/requests`, `/requests/:id`, `/requests/new` |
| Tutor | `/tutor/dashboard`, `/tutor/profile`, `/tutor/timetable`, `/tutor/income`, `/tutor/map`, `/tutor/find-students`, `/tutor/requests`, `/tutor/requests/:id` |
| Admin | `/admin/dashboard` |

Demo: `minhanh`, `giabao`, `admin` / password `demo1234`. Product routes kiểm tra phiên và role demo; chưa đăng nhập sẽ tới shared Login và giữ internal redirect. `/tutor/availability` và `/tutor/lessons` là URL legacy redirect tới `/tutor/timetable`.

Search mở hồ sơ gia sư thành trang riêng. Form yêu cầu nằm trong hồ sơ; nút “Tạo yêu cầu mới” ở chi tiết request mở form đúng gia sư. Các trang Learner app dùng header đã đăng nhập. Dashboard cho sửa thông tin cá nhân/địa chỉ; Tutor có lịch rảnh/lịch dạy chung và tìm học viên theo lịch đã lưu.

## Source và tài liệu

```text
apps/web/src/
  App.jsx, main.jsx     routing và entry
  components/           shared primitives
  data/                 dữ liệu và helper demo
  features/public/      landing và public chrome
  features/auth/        mock auth, Login/Register, route guard, OTP
  features/learner/     Search, hồ sơ, Dashboard, map, requests
  features/tutor/       workspace, hồ sơ, lịch, tìm lớp/học viên, requests
  features/admin/       dashboard vận hành
  hooks/                storage và dialog focus
  styles/               tokens, reset, global, shared flows
```

- [`AGENTS.md`](AGENTS.md): quy tắc coding và thứ tự đọc.
- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md): đề bài gốc; các gợi ý công nghệ/full-stack không phải stack hiện hành.
- [`DESIGN.md`](DESIGN.md): visual hiện hành, phạm vi từng reference.
- [`PRODUCT_SPEC.md`](docs/planning/PRODUCT_SPEC.md): behavior đã chốt và backlog.
- [`ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md): routes, source và mock persistence hiện tại.
- [`SCREEN_INVENTORY.md`](docs/screens/SCREEN_INVENTORY.md): ID, MVP và trạng thái từng màn.
- [`FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md): preserved evidence; Learner/Tutor không tự restore Figma cũ, Admin Figma vẫn là active structural reference cho phase Admin sau này. Policy chi tiết theo role tại AGENTS/DESIGN.
- [`PROJECT_HISTORY.md`](docs/archive/PROJECT_HISTORY.md): archive không có hiệu lực implementation.

`reference/final/` lưu static visual reference; `reference/figma/` lưu export cấu trúc; `reference/brief/` giữ nguồn đề bài. Sáu hồ sơ gia sư gốc ở `src/data/tutors.js`; `public.js` chuyển chúng sang dạng landing.

## Giới hạn hiện tại

- Auth/OAuth/OTP, map và các trạng thái nghiệp vụ đều mô phỏng frontend; không có bảo mật hoặc matching server.
- Auth dùng localStorage/sessionStorage theo Remember login. Shared Learner/Tutor domain dùng `tnm.demo.domain.v1`, private requests/saved tutors scope theo account ID; chưa đồng bộ giữa thiết bị. Admin chưa nối vào domain này.
- Thu nhập Tutor và Dashboard derive từ completed Lessons theo ngày học, dùng sessionFee snapshot từ Request; không dùng giá profile hiện tại. historicalLessons chỉ seed vào cùng runtime Lessons, restore thêm ID còn thiếu mà giữ dữ liệu runtime. Backend Lesson adapter có thể thay provider sau này mà không rewrite UI. Chưa có thanh toán hay số dư thật; progress/reviews minh họa vẫn là demo.
- Các màn chưa implement vẫn là backlog trong inventory. Không xem nhãn sidebar hoặc hình Figma là bằng chứng chức năng đã chạy.
