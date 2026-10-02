# AGENTS.md – Quy tắc cho Codex / coding agent

## Phạm vi hiện tại

TutorNearMe hiện là FRONTEND-ONLY interactive prototype.

Ở giai đoạn hiện tại:

- dùng mock data và local frontend state;
- tập trung vào UI, navigation, responsive và interaction;
- không thiết kế hoặc implement database;
- không implement backend/API thật;
- không thiết kế ORM, migrations hoặc transaction logic;
- không tự mở rộng project thành full-stack nếu chưa được yêu cầu.

Các trạng thái nghiệp vụ hiện tại chỉ phục vụ việc mô phỏng UI,
không được tự coi là backend business rules cuối cùng.


## Trước khi code

Luôn đọc theo thứ tự:

1. `PROJECT_BRIEF.md`
2. `DESIGN.md`
3. `docs/design/FIGMA_ANALYSIS.md`
4. `docs/planning/MVP_SCOPE.md`
5. `docs/screens/SCREEN_INVENTORY.md`
6. Flow tương ứng trong `docs/flows/`
7. `DESIGN.md` của role đang làm trong `apps/web/src/features/<role>/`

Nếu các tài liệu có mâu thuẫn, không tự đoán.
Hãy báo rõ conflict trước khi implementation.


## Source of truth cho UI

Sử dụng nguồn theo thứ tự ưu tiên:

1. Yêu cầu mới nhất của user.
2. `AGENTS.md`
3. `DESIGN.md`
4. `docs/design/FIGMA_ANALYSIS.md`
5. `docs/screens/SCREEN_INVENTORY.md`
6. Role flow trong `docs/flows/`
7. Các tài liệu planning/reference khác.

`docs/design/FIGMA_ANALYSIS.md` là nguồn lưu trữ lâu dài
cho những gì đã đọc được từ Figma MCP và Figma exports.

Không phụ thuộc vào session memory để nhớ Figma.


## Quy tắc kiến trúc frontend

- Không implement cả 3 role trong một giant component.
- Tách role theo `learner`, `tutor`, `admin` nhưng chia sẻ primitives chung.
- Không duplicate Button/Input/Modal/Table/Badge giữa role folders.
- UI component không hard-code dữ liệu demo nếu có thể truyền bằng props.
- Mock data nên được tách khỏi presentation component khi hợp lý.
- Shared component chỉ nên chứa behavior/design thực sự dùng chung giữa các role.
- Không ép Learner, Tutor và Admin sử dụng cùng một app shell nếu UX của chúng khác nhau.


## Quy tắc Figma

- Figma là nguồn tham chiếu chính về bố cục, hierarchy, information grouping
  và navigation pattern.
- `docs/design/FIGMA_ANALYSIS.md` lưu lại những findings đã được xác nhận.
- Không gọi lại Figma MCP trừ khi user yêu cầu hoặc thực sự cần thông tin chưa có.
- Không chuyển x/y tuyệt đối thành CSS absolute một cách máy móc.
- Dùng Flexbox/Grid/containers/responsive layout.
- Không coi exact pixel dimensions trong Figma là responsive specification.
- Bảng màu Figma hiện tại không phải final.
- Typography hiện tại không bắt buộc giữ nếu design direction mới tốt hơn.
- Placeholder icon, emoji, glyph và decoration trong Figma không phải final.
- Không được suy rộng thông tin từ một role sang role khác nếu chưa có evidence.
- Nội dung được đánh dấu `UNKNOWN` phải tiếp tục là UNKNOWN cho đến khi có nguồn xác nhận.

Ưu tiên giữ từ Figma:

- layout structure;
- information hierarchy;
- section arrangement;
- navigation pattern;
- data grouping;
- useful interaction patterns.

Được phép redesign:

- palette;
- typography;
- icon system;
- shadows;
- radius;
- border treatment;
- exact spacing;
- decorative styling;
- responsive adaptation;
- hover/focus/motion states.


## Quy tắc theo role

### Learner / Parent

Ưu tiên:

- approachable;
- discovery-oriented;
- dễ tìm và so sánh gia sư;
- bố cục thoáng hơn;
- trust và clarity.

Learner sử dụng consumer/public navigation pattern,
không ép sang dashboard sidebar nếu không cần thiết.


### Tutor

Ưu tiên:

- professional;
- task-oriented;
- schedule-driven;
- dễ xử lý request, lịch và học viên;
- information density vừa phải.

Tutor sử dụng workspace/sidebar pattern.


### Admin

Ưu tiên:

- information-dense;
- scan nhanh;
- table/filter/status rõ;
- action dễ tìm;
- decoration tối thiểu.

Admin sử dụng operational dashboard/sidebar pattern.


## Quy tắc làm từng luồng

Chỉ chỉnh role được yêu cầu trừ khi cần thay đổi shared design system.

Nếu shared component thay đổi, phải kiểm tra ảnh hưởng tới cả 3 role.

Khi tạo màn hình chưa có trong Figma:

- dùng role shell hiện có;
- dùng screen inventory và flow để xác định chức năng;
- dùng pattern gần nhất trong `FIGMA_ANALYSIS.md`;
- không tự thêm chức năng ngoài scope chỉ để làm màn hình đầy hơn.


## Visual quality

Không mặc định tạo giao diện kiểu generic AI/SaaS.

Tránh:

- purple/blue gradient SaaS mặc định;
- glassmorphism không cần thiết;
- mọi section đều nằm trong card;
- excessive rounded cards;
- excessive shadows;
- oversized hero text ở dashboard;
- random gradient;
- icon không đồng nhất;
- component-library default styling không chỉnh sửa.

Ưu tiên:

- distinctive;
- modern;
- trustworthy;
- educational nhưng không trẻ con;
- accessible;
- coherent visual hierarchy;
- deliberate spacing;
- một icon family thống nhất.


## Responsive

Figma hiện tại chủ yếu là desktop reference.

Không scale nguyên desktop xuống mobile.

Phải thiết kế lại layout phù hợp:

- desktop;
- tablet;
- mobile.

Các table/calendar/filter/sidebar phải có responsive strategy riêng.


## Verification

Trước khi kết thúc một batch UI:

- chạy app;
- kiểm tra responsive;
- kiểm tra các viewport chính;
- chụp/đối chiếu giao diện;
- sửa overflow;
- sửa spacing;
- sửa typography;
- sửa icon;
- kiểm tra loading/empty/error states nếu có;
- kiểm tra hover/focus/disabled states;
- kiểm tra accessibility cơ bản;
- không tuyên bố xong khi chưa visual review.


## Khi kết thúc session

Nếu có quyết định thiết kế hoặc thay đổi quan trọng:

- cập nhật tài liệu project tương ứng;
- không chỉ lưu quyết định trong conversation;
- không coi Codex memory/session memory là source of truth;
- ghi UNKNOWN nếu thông tin chưa được xác nhận.