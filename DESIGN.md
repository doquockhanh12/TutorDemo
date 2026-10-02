# TutorNearMe — Nền tảng thiết kế

## Visual direction

**TutorNearMe — Editorial Utility** là một thương hiệu thống nhất với ba trải nghiệm riêng theo vai trò. Learning Editorial tạo nền tảng giáo dục ấm áp, điềm tĩnh; Clear Ledger định hình ngôn ngữ UI vận hành cho Tutor và Admin.

- **Learner / Parent:** ưu tiên khám phá, thân thiện và thoáng (khoảng 70% Editorial / 30% Ledger).
- **Tutor:** chuyên nghiệp, có tổ chức, lấy yêu cầu và lịch làm trọng tâm (khoảng 35% Editorial / 65% Ledger).
- **Admin:** mật độ thông tin cao, dễ quét nhanh, trang trí tối thiểu (khoảng 20% Editorial / 80% Ledger).

## Quy tắc thương hiệu và hình ảnh

- Dùng canvas off-white ấm, surface trắng ấm, màu mực đậm, xanh pine/forest làm màu thương hiệu và terracotta làm điểm nhấn tiết chế. Màu ngữ nghĩa dành cho trạng thái, luôn bảo đảm độ tương phản.
- **Source Sans 3** là mặc định cho UI/body; **Literata** chỉ dùng tiết chế cho heading hiển thị của Learner; Admin chỉ dùng sans-serif. Đây là lựa chọn mặc định đã duyệt, không phải dependency bất biến. Nếu cách hiển thị tiếng Việt, khả năng đọc hoặc tương thích kỹ thuật không đạt, có thể thay bằng lựa chọn tương đương và phải cập nhật design docs.
- **Lucide** là icon family mặc định đã duyệt, không phải dependency bất biến. Dùng một family nhất quán; nếu cần thay vì lý do tương thích hoặc hiển thị, hãy chọn lựa chọn tương đương và cập nhật design docs.
- Giữ chung hệ thống spacing, type, radius, border, control và motion; điều chỉnh density theo vai trò: **comfortable** cho Learner, **standard** cho Tutor, **compact** cho Admin.
- Learner desktop dùng content container nhất quán với max width trong khoảng **1200–1280px**, chọn theo từng màn. Workspace Tutor/Admin có thể tận dụng chiều rộng shell; tất cả màn vẫn dùng page-padding token nhất quán.
- Ưu tiên whitespace, grouping, chuyển nền và divider thay vì bọc mọi section trong card. Dùng shadow tiết chế; shell và hierarchy theo từng role phải khác biệt rõ.
- Giữ hierarchy layout, grouping thông tin, thứ tự section và navigation hữu ích từ Figma. Palette, typography, icon placeholder, decoration và spacing chính xác trong Figma không phải quy chuẩn bắt buộc. Xem [FIGMA_ANALYSIS.md](docs/design/FIGMA_ANALYSIS.md) để biết findings và nguồn.

## Responsive và tương tác

- Desktop: **≥1280px**; tablet: **768–1279px**; mobile: **<768px**. Reflow nội dung thay vì thu nhỏ desktop; cần có chiến lược riêng cho navigation, table, filter và calendar.
- Dùng transition nhanh, tiết chế trong khoảng **120–200ms**. Focus phải nhìn thấy được, target đủ lớn, text đủ tương phản; không biểu đạt trạng thái chỉ bằng màu. Body/table cần dễ đọc.
- Prototype hiện là frontend-only: dùng mock data và local UI state. Status/action chỉ phục vụ màn hình và demo, không xác lập business rule backend.

## Đặc tả đầy đủ

Xem [docs/design/VISUAL_DIRECTION.md](docs/design/VISUAL_DIRECTION.md) để biết token, component, cách điều chỉnh theo role và responsive. Giữ [docs/design/FIGMA_ANALYSIS.md](docs/design/FIGMA_ANALYSIS.md) riêng làm tài liệu tham chiếu evidence từ Figma.
