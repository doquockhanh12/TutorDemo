# Screen Inventory

ID được giữ ổn định. **MVP** là mức ưu tiên sản phẩm, **Trạng thái** là mức triển khai hiện tại; Yes không có nghĩa đã có page riêng. Route chính xác nằm trong [ARCHITECTURE.md](../architecture/ARCHITECTURE.md), behavior trong [PRODUCT_SPEC.md](../planning/PRODUCT_SPEC.md).

Learner/Tutor ưu tiên current implementation/behavior; Figma chỉ historical/reference evidence trừ parity cụ thể do user yêu cầu. Admin đã có các màn operational được liệt kê dưới đây; phần chưa triển khai vẫn Planned. Admin Figma tiếp tục là active structural evidence đến khi user duyệt reference mới. Một frame Figma không có nghĩa screen đã implement.

## Learner / Parent

| ID | Screen | MVP | Trạng thái / route |
|---|---|---|---|
| L01 | Login | Yes | Implemented, shared `/login` |
| L02 | Register | Yes | Implemented `/register` |
| L03 | Tutor Search / Discovery | Yes | Implemented `/learner/search` |
| L04 | Search Filters | Yes | Tích hợp L03; nhiều môn/khu vực/thời gian |
| L05 | Tutor Profile Detail | Yes | Implemented `/tutors/:id`; thông tin, review, lịch tuần chỉ xem; CTA sticky mở booking dialog |
| L06 | Create Tutoring Request | Yes | Booking dialog mở từ L05; `/requests/new` mở dialog cho đúng gia sư |
| L07 | Request Confirmation | Yes | Tích hợp L09 sau submit; chưa có page riêng |
| L08 | My Requests | Yes | Implemented `/requests` |
| L09 | Request Detail / Status | Yes | Implemented `/requests/:id` |
| L10 | Confirmed Schedule / Lesson Detail | Yes | Thông tin lịch trong L09; chưa có lesson page riêng |
| L11 | Submit Tutor Review | Yes | Form trong L09 khi Hoàn tất; chưa có route riêng |
| L12 | Learner Account/Profile | Recommended | Implemented `/learner/dashboard`; sửa hồ sơ/địa chỉ |
| L13 | Bản đồ gia sư gần bạn | Approved demo extension | Implemented `/map`, bản đồ minh họa và so sánh khoảng cách demo |

L03/L04 dùng hero Search riêng nhỏ gọn, tìm kiếm trong viewport đầu tiên và một bộ lọc nhiều lựa chọn; desktop dùng dropdown, mobile dùng dialog. Kết quả dùng lưới full-width 3/2/1 cột và có link tới L13 `/map`. Landing `/learner` giữ hero public hiện có. Các trang app dùng LearnerHeader có Tìm gia sư, Yêu cầu học (`/requests`), Góc phụ huynh (`/learner#stories`) và dropdown avatar/username; active state theo route. Dropdown dẫn tới L11, `/requests`, phần `#saved-tutors` của L11 và Đăng xuất hiện có; không tạo màn gia sư đã lưu riêng. L08 không có nút tạo yêu cầu; nút chỉ ở L09 và dẫn tới gia sư trong request.

## Tutor

| ID | Screen | MVP | Trạng thái / route |
|---|---|---|---|
| T01 | Login | Yes | Shared `/login`, không role selector |
| T02 | Register / Onboarding | Yes | `/tutor/register`; onboarding mở rộng còn backlog |
| T03 | Dashboard | Yes | Implemented `/tutor/dashboard` |
| T04 | Edit Tutor Profile | Yes | Implemented `/tutor/profile` |
| T05 | Subject Settings | Yes | Tích hợp T04; chưa có page riêng |
| T06 | Pricing Settings | Yes | Tích hợp T04; chưa có page riêng |
| T07 | Teaching Location Settings | Yes | Tích hợp T04; chưa có page riêng |
| T08 | Availability | Yes | Chỉnh availability range, Lưu/Hủy trong `/tutor/timetable` |
| T09 | Incoming Requests | Yes | Implemented `/tutor/requests` |
| T10 | Request Detail | Yes | Implemented `/tutor/requests/:id` |
| T11 | Accept / Reject State | Yes | Action trong dashboard/request/detail |
| T12 | Confirmed Schedule / Lessons | Yes | Lesson theo ngày/giờ cụ thể, chung `/tutor/timetable` với T08 |
| T13 | Lesson Detail | Yes | Modal giữa màn hình từ timetable, thông tin lớp và ghi chú lưu local; chưa có route riêng |
| T14 | Mark Lesson Completed | Yes | Action trong timetable/detail hiện có |
| T15 | Tìm học viên mới | Approved demo extension | Implemented `/tutor/find-students` |
| T16 | Tìm lớp gần tôi | Approved demo extension | Implemented `/tutor/map`, bản đồ minh họa |
| T17 | Thu nhập | Approved demo extension | Implemented protected `/tutor/income`; monthly summary, SVG 6 tháng và danh sách buổi tạo thu nhập từ shared Lessons |

T03 hiện dùng header workspace với map/tổng quan/avatar/logout và grouping đã phát triển từ Figma cũ; đây là mô tả current implementation, không phải chỉ thị restore Figma. Sidebar hiện có 9 mục; nhãn chưa có route không phải page đã implement. Preview Sáng/Chiều/Tối chỉ đọc và nhóm availability range đã lưu, link tới timetable để chỉnh range; không chỉnh lịch trực tiếp tại dashboard. T08/T12 dùng chung timeline range 7 ngày từ 06:00–24:00, thời điểm bắt đầu muộn nhất 22:00, session 45 hoặc 90 phút. `/tutor/availability` và `/tutor/lessons` chỉ là protected redirects.

## Admin

| ID | Screen | MVP | Trạng thái |
|---|---|---|---|
| A01 | Admin Login | Yes | Shared `/login`, không `/admin/login` |
| A02 | Dashboard | Yes | Implemented `/admin/dashboard`; duyệt/review/issue actions demo |
| A03 | User List | Yes | Implemented `/admin/users` |
| A04 | User Detail / Account Status | Yes | Drawer trong A03 |
| A05 | Tutor List | Yes | Implemented `/admin/tutors` |
| A06 | Tutor Detail / Status | Yes | Drawer trong A05 |
| A07 | Subject Management | Yes | Planned |
| A08 | Review Management | Yes | Implemented `/admin/reviews`; moderation và drawer |
| A09 | Account Issues / Suspended Requests | Yes | Implemented `/admin/issues`; dùng chung A12 |
| A10 | Issue Detail | Yes | Drawer trong A09/A12; lịch sử báo cáo hai bên |
| A11 | Location Management | Recommended/Core-support | Planned |
| A12 | Reports / Complaints | User-approved | Implemented `/admin/issues`, báo cáo/cảnh cáo theo account ID |
| A13 | System Settings | Later | Planned |
| A14 | Logs / Permissions | Later | Planned |
| A15 | Appeal Review | User-approved extension | Implemented `/admin/appeals`; xem bằng chứng, căn cứ xét duyệt |

## Chưa triển khai trong prototype

Map thật/geocoding/distance matching, chat, gói học, xác minh thẻ sinh viên và backend permission. Map demo L13/T16 đã được duyệt riêng; không đồng nghĩa các mở rộng thật đã được implement.

## Kháng cáo — approved extension (2026-10-05)

`/appeals` là trang dùng chung cho Learner/Tutor gửi và theo dõi kháng cáo; form yêu cầu sự cố thuộc bên bị báo cáo, nội dung giải trình, bằng chứng và cam kết trung thực. Tài khoản bị khóa có thể xác thực phiên chỉ dành cho kháng cáo; không mở product routes. Không renumber screen IDs hiện có.
