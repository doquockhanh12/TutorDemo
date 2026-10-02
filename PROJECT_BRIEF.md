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

## Nguồn tham chiếu đã lưu

- Bản gốc đề tài: [`reference/brief/IE104_Quan_ly_du_an.xlsm`](reference/brief/IE104_Quan_ly_du_an.xlsm), sheet `2_Goi_y_de_tai`, STT 4. [Google Drive gốc](https://docs.google.com/spreadsheets/d/1oGQ0ZR9oTIpDFqdmPBf0LzaFDlwbgHy9/edit?gid=698143046#gid=698143046).
- Sơ đồ ba role: [`reference/brief/workflow-3-roles.png`](reference/brief/workflow-3-roles.png).
- [Figma UI_Web](https://www.figma.com/design/1moupOCQHM6eiB7jUgUk6S/UI_Web?node-id=0-1&t=fImKdVKi6IxMeIEs-0): dùng cho bố cục, grouping, hierarchy và navigation. Các phát hiện đã xác nhận và giới hạn bằng chứng nằm trong [`docs/design/FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md). Không khóa palette Figma hoặc chuyển x/y tuyệt đối thành layout responsive.

Đây là **đề bài gốc**, gồm cả gợi ý mở rộng và công nghệ của môn học. Phạm vi thực hiện hiện tại là frontend-only theo [`docs/planning/PRODUCT_SPEC.md`](docs/planning/PRODUCT_SPEC.md); không diễn giải danh sách entity thành database schema đang triển khai.
