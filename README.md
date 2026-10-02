# TutorNearMe – Frontend prototype

TutorNearMe là đồ án website tìm gia sư sinh viên theo khu vực (hyperlocal). Project hiện là **frontend-only interactive prototype**, tách rõ ba luồng giao diện **Người học/Phụ huynh**, **Gia sư**, **Admin** và dùng chung nền tảng thiết kế.

## Nguồn đầu vào đã tổng hợp

- Đề tài số 4 trong sheet `2_Goi_y_de_tai`: **TutorNearMe – Gia sư sinh viên hyperlocal**.
- Sơ đồ 3 luồng công việc do nhóm cung cấp.
- Figma hiện tại: dùng chủ yếu làm **tham chiếu bố cục / information architecture**, không khóa màu sắc hiện tại.

## Cách dùng khung này

1. Đọc `PROJECT_BRIEF.md` và `DESIGN.md` ở thư mục gốc.
2. Đọc `docs/planning/MVP_SCOPE.md` để biết phạm vi bắt buộc.
3. Khi làm UI bằng Codex, chạy prompt theo thứ tự trong `prompts/`.
4. Ba luồng UI được phát triển riêng trong `apps/web/src/features/learner`, `tutor`, `admin`.
5. Thành phần dùng chung phải đặt trong `apps/web/src/components` hoặc `apps/web/src/design-system` thay vì copy giữa 3 luồng.

## Stack đã chốt

Frontend dùng **React, JavaScript, Vite, React Router, CSS thuần và Lucide Icons**. Dữ liệu hiện là mock/local state; không có backend, database hay API thật.

Ba màn đại diện hiện được triển khai trong `apps/web`: Learner Tutor Search, Tutor Dashboard và Admin Dashboard. Xem [hướng dẫn chạy app](apps/web/README.md).

## Nguyên tắc thiết kế quan trọng

- Giữ **bố cục và cách tổ chức thông tin** tốt từ Figma hiện tại.
- Không xem bảng màu hiện tại là final.
- Ba luồng có thể khác về mật độ và cảm giác sử dụng, nhưng phải cùng một brand/design system.
- Không để AI tự phát minh toàn bộ màn hình mà không đọc `docs/screens/SCREEN_INVENTORY.md`.
