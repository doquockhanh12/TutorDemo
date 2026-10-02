# TutorNearMe — Design source of truth

TutorNearMe hiện là **frontend-only interactive prototype**. Ba bản finalized dưới đây là nguồn **appearance cao nhất**; giữ nguyên file gốc để đối chiếu:

- [`reference/final/homepage/`](reference/final/homepage/) — trang chủ `/`;
- [`reference/final/learner/`](reference/final/learner/) — landing Người học / Phụ huynh `/learner`;
- [`reference/final/tutor/`](reference/final/tutor/) — landing tuyển gia sư `/tutor`, **không phải** Tutor Dashboard.

Chúng quy định visual family, typography, nhịp spacing, màu và interaction. Giữ khác biệt sắc độ giữa từng reference khi cần đạt visual parity; chỉ chuẩn hóa token khi không làm thay đổi giao diện. Figma là nguồn **cấu trúc**: xem [`FIGMA_ANALYSIS.md`](docs/design/FIGMA_ANALYSIS.md) để biết bằng chứng, giới hạn và các mục `UNKNOWN`.

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
| Learner / Parent | Top navigation công khai; tìm, lọc, lưu và so sánh gia sư theo môn/khu vực/lịch/phí; hồ sơ, yêu cầu, theo dõi. Thoáng, tin cậy, dễ đọc. CTA xem/gửi/xác nhận rõ; thao tác hủy ít nổi bật hơn. |
| Tutor public `/tutor` | Landing tuyển gia sư: cơ hội dạy, yêu cầu phù hợp, minh họa thu nhập, tạo hồ sơ, lịch rảnh và sự riêng tư. |
| Tutor workspace | Sidebar/topbar riêng; tập trung yêu cầu chờ, buổi học sắp tới, lịch rảnh và trạng thái. Mật độ vừa, thao tác hiệu quả. |
| Admin | Chưa có finalized reference. Dùng Nunito/Nunito Sans và token chung với cường độ màu thấp hơn; bảng, bộ lọc, trạng thái, duyệt hồ sơ và xử lý vấn đề phải scan nhanh. Không sao chép bố cục landing. |

Không ép ba vai trò vào một app shell. Dùng shared primitives khi behavior và visual thực sự giống nhau. Các màn chưa có reference phải dựa vào [`SCREEN_INVENTORY.md`](docs/screens/SCREEN_INVENTORY.md), [`PRODUCT_SPEC.md`](docs/planning/PRODUCT_SPEC.md) và structural Figma.

## Implementation và responsive

Public header dùng chung cho các landing và Auth phải giữ hiệu ứng của finalized reference: `position: sticky` ở mép trên, nền bán trong suốt; cuộn quá 18px bật blur 22px/saturate 155%, đổi nền, border và shadow với transition 220ms. Giữ underline hover của navigation desktop và chuyển động nhẹ của CTA; reduced-motion phải được tôn trọng. Không thay bằng header `position: relative` khi port sang React.

Stack hiện hành: React, JavaScript, Vite, React Router, CSS thuần và Lucide. Port cấu trúc/interaction từ static reference sang React; không dán nguyên HTML/CSS hoặc thay stack. Chỉ dùng mock data/local frontend state; business status hiện là trạng thái UI demo.

Desktop từ 1280px, tablet 768–1279px, mobile dưới 768px. Reflow section, filter, table, calendar và sidebar theo từng loại màn; không co nguyên bản desktop xuống mobile hoặc lấy x/y Figma làm CSS absolute. Focus visible, target đủ lớn, trạng thái có text/icon ngoài màu, body/table dễ đọc. Kiểm tra overflow, clipping và tiếng Việt ở các viewport chính.
