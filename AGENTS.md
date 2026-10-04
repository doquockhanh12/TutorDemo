# AGENTS.md – Quy tắc cho Codex / coding agent

## Auth V4 implementation guardrails

- Keep one shared `/login` route; do not add role-specific login pages.
- Preserve and validate internal `redirect` through login and registration; reject external destinations.
- Provider-prefill only fields present in the explicit mock payload. Never invent Facebook email or phone data.

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
2. `DESIGN.md` và reference tương ứng trong `reference/final/`
3. `docs/design/FIGMA_ANALYSIS.md`
4. `docs/planning/PRODUCT_SPEC.md`, nhất là flow của role đang làm
5. `docs/screens/SCREEN_INVENTORY.md`

Nếu các tài liệu có mâu thuẫn, không tự đoán.
Hãy báo rõ conflict trước khi implementation.


## Source of truth cho UI theo role

Policy Figma phụ thuộc role; không áp một thứ tự nguồn duy nhất cho cả ba khu vực. Các guardrail frontend/auth trong AGENTS vẫn áp dụng cho mọi role.

### Learner / Tutor — current implementation

Thứ tự ưu tiên:

1. Latest explicit user instruction.
2. Current batch prompt, trong phạm vi yêu cầu user mới nhất.
3. `docs/planning/PRODUCT_SPEC.md` hiện hành.
4. `docs/architecture/ARCHITECTURE.md` hiện hành.
5. Current React implementation và current product behavior.
6. `DESIGN.md` và finalized visual references hiện hành.
7. Learner/Tutor Figma: historical/reference evidence trong `docs/design/FIGMA_ANALYSIS.md`.

Current Learner/Tutor implementation wins unless user explicitly asks to return a specific screen or part to Figma parity. Figma không còn là structural contract mặc định cho hai role này. Không tự restore layout, navigation, sidebar, scheduling split, section hierarchy, interaction hoặc mock data cũ chỉ vì Figma khác React hiện tại. Yêu cầu parity cụ thể chỉ có hiệu lực trong phạm vi user chỉ định; không tự áp sang các màn khác.

### Admin — future implementation

Thứ tự ưu tiên:

1. Latest user instruction.
2. AGENTS và current product requirements.
3. `docs/screens/SCREEN_INVENTORY.md` / `docs/planning/PRODUCT_SPEC.md`.
4. Admin Figma structural evidence đã lưu trong `docs/design/FIGMA_ANALYSIS.md`.
5. Current TutorNearMe visual system trong `DESIGN.md`.
6. Existing Admin React implementation ở những phần tương thích.

Admin Figma vẫn là primary structural reference cho future Admin screens chưa có newer user-approved Admin structure/reference. Dùng evidence cho sidebar/topbar, hierarchy, grouping, table/filter, detail panel và composition của moderation/approval workflows. Không bỏ hoặc invalidate Admin evidence vì Learner/Tutor đã vượt qua Figma cũ. Chỉ thay thế policy này khi user duyệt Admin structure/reference mới; không tự suy parity thành route/feature đã implement.

### Final visual references

`reference/final/homepage/`, `reference/final/learner/`, `reference/final/tutor/`, `reference/final/auth-v4/` tiếp tục quyết định appearance của homepage, Learner landing, Tutor landing và Auth tương ứng theo yêu cầu hiện hành. README reference chỉ mô tả bản static; routes/scope/behavior React lấy từ tài liệu hiện hành. Đây không phải Learner/Tutor Figma cũ.

Editorial Utility xanh rêu được bảo tồn trong `docs/archive/PROJECT_HISTORY.md` và là tài liệu lịch sử **DEPRECATED**. Finalized reference quy định hệ visual xanh/đỏ/vàng/cyan/violet/kem, Nunito/Nunito Sans. Không dùng lại xanh rêu làm brand. Green ngữ nghĩa cho success/verified/available vẫn hợp lệ.

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

- Learner/Tutor Figma chỉ là historical/reference evidence, trừ yêu cầu parity cụ thể của user; Admin Figma vẫn là active structural evidence cho future Admin work cho đến khi user duyệt reference mới.
- Không restore old Learner/Tutor Figma tự động, không invalidate Admin Figma, không suy Figma policy của một role sang role khác.
- `docs/design/FIGMA_ANALYSIS.md` lưu lại những findings đã được xác nhận.
- Không gọi lại Figma MCP trừ khi user yêu cầu hoặc thực sự cần thông tin chưa có.
- Không chuyển x/y tuyệt đối thành CSS absolute một cách máy móc.
- Dùng Flexbox/Grid/containers/responsive layout.
- Không coi exact pixel dimensions trong Figma là responsive specification.
- Bảng màu Figma hiện tại không phải final.
- Font/icon/palette Figma cũ không khóa implementation: dùng Nunito/Nunito Sans, Lucide, semantic tokens và current brand colors; không tự thay current visual system.
- Placeholder icon, emoji, glyph và decoration trong Figma không phải final.
- Không được suy rộng thông tin từ một role sang role khác nếu chưa có evidence.
- Nội dung được đánh dấu `UNKNOWN` phải tiếp tục là UNKNOWN cho đến khi có nguồn xác nhận.

Với future Admin implementation, ưu tiên cấu trúc từ Admin Figma:

- layout structure;
- information hierarchy;
- section arrangement;
- navigation pattern;
- data grouping;
- useful interaction patterns.

Admin Figma không khóa các treatment sau; dùng current visual system và responsive/accessibility rules:

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

Tutor workspace sử dụng sidebar pattern. Trang public `/tutor` là landing tuyển gia sư theo `reference/final/tutor/`, không dùng workspace shell.


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

Khi tạo màn hình chưa có implementation:

- Learner/Tutor dùng role shell hiện có; Admin reuse shell hiện có ở phần tương thích với Admin Figma/current requirements;
- dùng screen inventory và flow để xác định chức năng;
- Learner/Tutor: dùng pattern current React và current product behavior; Figma chỉ tham khảo hoặc parity cụ thể khi user yêu cầu;
- Admin: dùng pattern Admin Figma gần nhất trong `FIGMA_ANALYSIS.md` cho cấu trúc, current visual system cho appearance;
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

Trong tổng kiểm duyệt frontend, đọc `docs/quality/FRONTEND_REGRESSION_NOTES.md` và thực hiện checklist QA đã duyệt. Kiểm tra cả fresh seed và persisted state sau reconciliation; cuộn hết vùng bên trong timetable, kiểm tra khung/hit target đè nhau ở giờ thu gọn/mở rộng và đối chiếu Lesson với Income qua ranh giới tháng. Không coi test overflow toàn trang hoặc ảnh đầu khung cuộn là đủ để xác nhận calendar không chồng khung.

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
