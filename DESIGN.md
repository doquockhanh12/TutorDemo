# TutorNearMe — Design source of truth

TutorNearMe hiện là **frontend-only interactive prototype**. Các finalized reference dưới đây quyết định appearance cho đúng khu vực, sau yêu cầu mới nhất của user; giữ nguyên HTML/CSS/JS reference để đối chiếu:

- [`reference/final/homepage/`](reference/final/homepage/) — trang chủ `/`;
- [`reference/final/learner/`](reference/final/learner/) — landing Người học / Phụ huynh `/learner`;
- [`reference/final/tutor/`](reference/final/tutor/) — landing tuyển gia sư `/tutor`, **không phải** Tutor Dashboard.
- [`reference/final/auth-v4/`](reference/final/auth-v4/) — appearance Login/Register/Phone modal. Behavior React theo [`PRODUCT_SPEC.md`](docs/planning/PRODUCT_SPEC.md); route và provider data trong static không ghi đè quyết định mới.

Chúng quy định visual family, typography, nhịp spacing, màu và interaction cho các trang tương ứng. Giữ khác biệt sắc độ giữa từng final reference khi cần đạt visual parity; chỉ chuẩn hóa token khi không làm thay đổi giao diện. Policy Figma riêng theo role nằm dưới đây; finalized visual references không bị loại bỏ bởi policy này.

## Policy Figma theo role

- **Learner / Tutor:** current React implementation + current product behavior là implementation source of truth, theo latest explicit user instruction/current batch prompt, PRODUCT_SPEC và ARCHITECTURE. Figma là historical structural evidence / optional reference, không phải structural contract mặc định. Không tự restore old layout/navigation/sidebar/scheduling split/section hierarchy/interaction/mock data. Chỉ quay lại parity cho màn hoặc phần cụ thể khi user yêu cầu rõ.
- **Admin:** Admin Figma là primary structural reference cho future Admin screens cho đến khi user phê duyệt Admin structure/reference mới. Dùng sidebar/topbar, information hierarchy/grouping, table/filter, detail panel và moderation/approval workflow composition; không khóa palette, font, placeholder icons, x/y, exact desktop dimensions hoặc mock content cũ.
- Admin vẫn dùng Nunito/Nunito Sans, Lucide, semantic tokens và current brand colors. Figma evidence không tự chứng minh feature đã implement và không ghi đè runtime architecture/routes.

[`FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md) giữ evidence của cả ba role; thứ tự nguồn chi tiết nằm trong [`AGENTS.md`](AGENTS.md). Không suy policy của một role sang role khác.

Hệ **Editorial Utility xanh rêu đã DEPRECATED**. Bản gốc được bảo tồn trong [`PROJECT_HISTORY.md`](docs/archive/PROJECT_HISTORY.md). Không dùng lại `#2E5B46`, `#1F2B25`, `#47534C`, Pine/Dark Pine hoặc moss/olive làm màu chính cho hero, navigation, CTA hay surface. Green vẫn dùng đúng nghĩa cho success, verified và available.

## Brand và typography

- TutorNearMe là marketplace giáo dục sống động, thân thiện, nhiều hình ảnh, tương phản rõ; trẻ trung nhưng đủ chuyên nghiệp. Không biến thành dashboard SaaS màu trầm.
- Hệ màu chung: strong/deep blue, red/coral, yellow, cyan/light blue, violet, cream/warm white. Dùng semantic CSS variables tại `apps/web/src/styles/tokens.css` cho component mới.
- **Nunito** cho heading; **Nunito Sans** cho UI/body. Body mặc định quanh 16px; kiểm tra cách hiển thị tiếng Việt. Không thu nhỏ text bảng/form chỉ để nhồi thêm dữ liệu.
- **Lucide** là một icon family thống nhất cho React UI. Không dùng emoji/glyph placeholder của Figma làm icon cuối.
- Tránh glassmorphism, gradient ngẫu nhiên, shadow dày, card bao mọi section và các role trông như cùng một dashboard thay nội dung.

## Cấu trúc theo vai trò

| Khu vực | Bố cục và ưu tiên |
|---|---|
| Homepage `/` | Hero giàu hình ảnh, tìm kiếm, bằng chứng gia sư, bản đồ/khu vực minh họa, nội dung học tập, ưu đãi và CTA theo nhịp màu của reference. |
| Learner / Parent | Consumer top navigation. Các trang app dùng `LearnerHeader` với avatar/username và Đăng xuất; không dùng header marketing chưa đăng nhập. Search dùng hero Learner, hai cột hỗ trợ trái/phải chung nền trắng/viền/bo góc/padding. Hồ sơ, dashboard và yêu cầu dùng cùng font/token. |
| Tutor public `/tutor` | Landing tuyển gia sư: cơ hội dạy, yêu cầu phù hợp, minh họa thu nhập, tạo hồ sơ, lịch rảnh và sự riêng tư. |
| Tutor workspace | Sidebar/topbar riêng; tập trung yêu cầu chờ, buổi học sắp tới, lịch rảnh và trạng thái. Mật độ vừa, thao tác hiệu quả. |
| Admin | Chưa có newer approved Admin reference: future screens tiếp tục dùng Admin Figma làm structural reference. Appearance dùng Nunito/Nunito Sans và current tokens; bảng/filter/status/detail phải scan nhanh. Không sao chép palette/font/icon placeholder hoặc bố cục landing. |

Không ép ba vai trò vào một app shell. Dùng shared primitives khi behavior và visual thực sự giống nhau. Màn Learner/Tutor mới dựa vào current role shell, PRODUCT_SPEC, ARCHITECTURE và screen inventory; không mặc định phục hồi Figma cũ. Màn Admin tương lai dùng screen inventory/product requirements và Admin Figma structure, cùng current visual system.

## Implementation và responsive

Public header dùng chung cho landing, Auth và Learner app phải giữ hiệu ứng của finalized reference: `position: sticky` ở mép trên, nền bán trong suốt; cuộn quá 18px bật blur 22px/saturate 155%, đổi nền, border và shadow với transition 220ms. LearnerHeader thay nội dung navigation/actions theo phiên demo, giữ behavior của PublicHeader. Giữ underline hover của navigation desktop và chuyển động nhẹ của CTA; reduced-motion phải được tôn trọng.

Stack hiện hành: React, JavaScript, Vite, React Router, CSS thuần và Lucide. Port cấu trúc/interaction từ static reference sang React; không dán nguyên HTML/CSS hoặc thay stack. Chỉ dùng mock data/local frontend state; business status hiện là trạng thái UI demo.

Desktop từ 1280px, tablet 768–1279px, mobile dưới 768px. Reflow section, filter, table, calendar và sidebar theo từng loại màn; không co nguyên bản desktop xuống mobile hoặc lấy x/y Figma làm CSS absolute. Focus visible, target đủ lớn, trạng thái có text/icon ngoài màu, body/table dễ đọc. Kiểm tra overflow, clipping và tiếng Việt ở các viewport chính.
