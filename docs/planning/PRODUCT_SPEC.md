# TutorNearMe — Product spec và kế hoạch frontend

## Auth V4 update (implemented)

- One shared login route `/login` resolves the demo role from the mock auth layer; Login has no role selector. Public registration is learner/parent at `/register` and tutor at `/tutor/register`; Admin has no public registration.
- Demo login and registration state is stored locally in the frontend. Protected product routes share `ProtectedRoute` and enforce the demo role; this is not backend authentication or authorization.
- Protected navigation preserves an internal `redirect` through login and registration. Invalid external/protocol-relative targets fall back to the authenticated role’s default destination. Learner’s current default is defined once as `LEARNER_HOME_PATH = '/learner/search'`.
- If a provider identity is already linked in the mock account data, it logs into that account and resolves its role. New provider identities enter the matching existing registration form; any provider prefill comes only from the explicit mock payload, with absent fields left blank.
- Google’s mock payload contains the approved V4 name and email and marks that email verified. Facebook’s payload contains only the approved V4 name; it does not generate an email or phone. Phone OTP uses `123456`, and a verified phone can be edited, which clears verification.
- After Google/Facebook/Phone verification, the registration page hides the entire quick-registration area and its divider. Password and confirmation remain required for every new account. Tutor subject choices follow the approved list, including DSA and `Khác`, with a conditional custom field.

Tài liệu này gộp scope, requirements, ba role flow, backlog, từ vựng dữ liệu và checklist bàn giao. [`PROJECT_BRIEF.md`](../../PROJECT_BRIEF.md) giữ đề bài gốc; [`SCREEN_INVENTORY.md`](../screens/SCREEN_INVENTORY.md) giữ ID màn hình ổn định. Nội dung đã gộp được bảo tồn nguyên văn tại [`PROJECT_HISTORY.md`](../archive/PROJECT_HISTORY.md).

## Phạm vi hiện tại

**Frontend-only interactive prototype** dùng mock data và local frontend state. Tập trung vào UI, navigation, responsive, validation phía client và tương tác có thể thử. Trạng thái yêu cầu, hồ sơ gia sư, lịch/buổi học và review chỉ phục vụ hiển thị demo; chưa phải quy tắc nghiệp vụ cuối cùng. Không triển khai auth/authorization backend, API thật, database, ORM, migration hoặc transaction.

### Core journey cần thể hiện

- **Người học / Phụ huynh:** tìm gia sư → lọc theo môn/khu vực/lịch rảnh/phí → so sánh, xem hồ sơ → gửi yêu cầu → theo dõi trạng thái → xem lịch/buổi học → đánh giá sau buổi học. Login/Register có mock frontend flow; chưa có authentication backend. Search, Filter và Results có thể chung một page.
- **Gia sư:** onboarding/login UI → tạo/sửa hồ sơ → chọn môn, mức phí, khu vực, lịch rảnh → xem yêu cầu → xem chi tiết → nhận/từ chối → theo dõi lịch đã xác nhận → đánh dấu buổi học hoàn tất. Dashboard ưu tiên agenda, pending work và availability.
- **Admin:** login UI → dashboard → quản lý người dùng, gia sư, môn học, đánh giá và tài khoản/vấn đề. List/filter/detail, duyệt hồ sơ và trạng thái phải rõ. Location management hỗ trợ dữ liệu khu vực.

Các flow trên mô tả **mục tiêu UI**, không xác nhận logic server. Màn nào chưa có route vẫn là backlog; xem [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) để phân biệt implemented với planned.

## Yêu cầu chức năng theo vai trò

| Vai trò | UI cần có trong phạm vi core |
|---|---|
| Learner / Parent | Đăng ký/đăng nhập UI; tìm/lọc gia sư; hồ sơ; gửi và theo dõi yêu cầu; trạng thái lịch/buổi học; review sau học. |
| Tutor | Đăng ký/đăng nhập UI; hồ sơ; môn dạy; phí; khu vực; lịch rảnh; inbox/detail yêu cầu; accept/reject demo; lịch xác nhận; hoàn tất buổi học. |
| Admin | Đăng nhập UI; dashboard; user/tutor/subject/review management; xử lý tài khoản có vấn đề; khu vực hỗ trợ filter. |

MVP đề bài có auth cơ bản và quyền theo role; Auth V4 hiện mô phỏng login, registration và protected-route behavior ở frontend. Không có authentication backend, permission thật hoặc guard server. Tutoring Request và Lesson cần status rõ để badge, filter và action hiển thị đúng; không suy ra schema hay transition cuối.

## Yêu cầu chất lượng cho prototype

- Responsive desktop, tablet, mobile; filter, table, calendar và sidebar có cách reflow riêng.
- Form validation phía client; loading, empty, error và disabled states ở nơi có ích cho demo.
- Keyboard focus, contrast, mục tiêu tương tác và text dễ đọc; trạng thái không chỉ dựa vào màu.
- Shared components và semantic design tokens thống nhất; không đưa thông tin nhạy cảm vào source control.

Yêu cầu cũ về server validation, API error handling, server logging và role authorization được lưu trong lịch sử. Chúng **không phải công việc implementation của frontend-only batch**.

## Ngoài phạm vi ban đầu / phase 2

- Map thật, geocoding, tọa độ và distance matching/ranking nâng cao. Landing hiện chỉ có bản đồ **minh họa local state** theo finalized reference; không dùng map API.
- Realtime chat, learning packages, payment, student-card verification tự động.
- Notification và những màn System Settings, Logs/Permissions chỉ khi được ưu tiên sau core.

Nếu tính năng mới không hỗ trợ trực tiếp core flow, ghi vào backlog trước khi triển khai.

## Từ vựng nghiệp vụ trong mock data

Đề bài nêu `User`, `TutorProfile`, `Subject`, `Location`, `Availability`, `TutoringRequest`, `Review`. Để biểu diễn trạng thái buổi học trong UI, có thể dùng khái niệm `TutoringSession/Lesson`. Một gia sư có thể có nhiều môn/khu vực; các tên `TutorSubject` và `TutorLocation` trong draft cũ chỉ là gợi ý domain **chưa chốt**, không phải bảng dữ liệu. `ChatConversation/Message`, `LearningPackage`, `TutorVerification`, `Notification` là optional. Draft gốc được lưu nguyên văn trong archive.

## Backlog và trạng thái

| Ưu tiên | Việc cần theo dõi |
|---|---|
| Core | Hoàn thiện Learner, Tutor, Admin flow theo screen inventory; responsive và visual QA; Auth V4 mock frontend flow đã implement. |
| Sau core | Map thật, verification mở rộng, chat, gói học, distance matching; không tự đưa vào prototype. |
| Quyết định nghiệp vụ còn mở | Role/auth model, request/lesson lifecycle, tutor approval và location model: chỉ mô phỏng state UI cho đến khi user chốt. |
| Bàn giao môn học | Requirement, user flow, wireframe/UI design, GitHub repository, slide, demo URL. |

Backlog cũ có các ô “chốt design direction/palette” và “chốt entity schema”; design direction đã được thay thế bằng finalized reference, còn schema chưa thuộc phạm vi frontend. Các ô cũ được giữ nguyên trong archive để không mất lịch sử quyết định.

## Checklist bàn giao

- [ ] Requirement và user flow nhất quán với screen inventory.
- [ ] Design/wireframe và bản frontend demo có thể mở bằng URL.
- [ ] GitHub repository gọn, README có hướng dẫn chạy và known limitations.
- [ ] Slide trình bày và demo URL.
- [ ] Screenshot hoặc GIF/video ngắn nếu hữu ích.
- [ ] Demo account hoặc `.env.example` **chỉ nếu** về sau có nhu cầu thực tế; prototype hiện không có auth backend hay env bắt buộc.
