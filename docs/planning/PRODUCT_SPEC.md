# TutorNearMe — Product spec và kế hoạch frontend

## Implementation priority và policy Figma

- **Active core batch:** hoàn thiện Learner/Tutor vertical slice theo latest user requirements, current behavior, PRODUCT_SPEC, ARCHITECTURE và React hiện tại. Learner/Tutor Figma chỉ historical/reference evidence; không tự restore structure cũ. Parity chỉ áp dụng cho màn/phần user yêu cầu rõ.
- **Admin:** dashboard, users, tutors, reviews, issues và appeals đã có implementation frontend; subject/location/settings/logs vẫn là future phase. Admin Figma vẫn là active structural reference cho future Admin work cho đến khi user duyệt Admin structure/reference mới; appearance dùng current TutorNearMe visual system.
- Chi tiết thứ tự nguồn theo role tại AGENTS.md; Figma không tự thay runtime architecture hoặc tạo trạng thái Implemented.

## Learner / Parent — behavior hiện hành

- Profile request selection: môn, cấp độ, hình thức và khu vực dùng button nhiều lựa chọn, đồng bộ với bản tóm tắt trong form; bỏ một lựa chọn trong form cũng bỏ trạng thái ở hồ sơ. Learner bắt buộc chọn ít nhất một cấp độ; thiếu cấp độ sẽ báo lỗi ở hồ sơ và form, không tạo request. Học tại nhà cần khu vực; online không bắt buộc khu vực.
- Lịch trong hồ sơ public hiển thị bảng 7 ngày gọn với các buổi có sẵn, không có dấu +, trục giờ chi tiết hoặc hộp sửa giờ. Learner nhấn để chọn/bỏ một hoặc nhiều buổi; form gửi yêu cầu cập nhật ngay. Mỗi khoảng bookable đã lưu được chia thành buổi 45 hoặc 90 phút theo setting Tutor, bắt đầu tại đầu khoảng; phần dư không đủ một buổi không hiển thị. Không tự thêm lịch hoặc cho Learner chọn mốc tùy ý. Mỗi proposal giữ ngày/giờ cụ thể, nằm trọn trong khoảng khả dụng, không trùng lựa chọn khác, bắt đầu không muộn hơn 22:00 và kết thúc tối đa 24:00. Màn nhỏ cuộn ngang bên trong bảng, giữ chữ và nút dễ đọc. Tutor vẫn chỉnh lịch bằng timeline riêng; registration dùng cùng thời lượng 45/90 phút.
- Form không yêu cầu nhập lại môn/lịch/hình thức/khu vực, chỉ nhập mục tiêu. Request local giữ đầy đủ các lựa chọn và proposal ngày/giờ cụ thể; chuỗi tóm tắt vẫn hỗ trợ request cũ. `/requests/new` đưa về form trong profile đúng gia sư, giữ subject/goal query khi có.

- Thẻ Search và bộ lọc sáng/chiều/tối/cuối tuần đọc public bookable ranges: `quoc-bao` dùng lịch đã lưu sau khi trừ lesson; các gia sư khác dùng adapter từ `tutors.js.schedule`. Nút Xem hồ sơ mở `/tutors/:id` thay cho quick-view modal.
- Hồ sơ gia sư hiện có thông tin, học phí, giới thiệu/phương pháp, môn/cấp độ, lịch tuần và khu vực ở trái; form gửi yêu cầu và review ở phải. Layout đã phát triển từ `reference/figma/learner/1A Tutor Detail + Request.png`, nay current implementation/behavior là nguồn thực thi, không phải hợp đồng parity với export cũ. Dùng cùng LearnerHeader, token và Nunito/Nunito Sans với Search. Chọn lịch điền form; gửi tạo yêu cầu local và mở trang trạng thái hiện có. Chi tiết bổ sung và review đều là dữ liệu demo.

- `/learner/search` giữ hero của Learner landing. Search, profile, dashboard, map và request list/detail dùng chung LearnerHeader: sticky/blur, Tìm gia sư, Góc phụ huynh, Trở thành Gia Sư, avatar/username và Đăng xuất. Header public Login/Register không được thay phiên hiển thị của các trang app.
- Avatar mở `/learner/dashboard`: hồ sơ cá nhân, địa chỉ, thống kê yêu cầu, lịch đã xác nhận và gia sư đã lưu. Default Auth destination vẫn là `/learner/search`.
- Dashboard cho phép sửa họ tên, loại người học/phụ huynh, email, điện thoại và địa chỉ dạng văn bản; có Lưu/Hủy, kiểm tra định dạng/trùng thông tin tài khoản demo. Username giữ nguyên. Sửa email/điện thoại sẽ bỏ trạng thái verified tương ứng; chưa triển khai xác minh lại tại dashboard.
- Hồ sơ cập nhật lưu trong mock auth theo account ID, phản ánh ngay trên header và giữ sau tải lại/đăng nhập lại. Giữ chế độ localStorage/sessionStorage của phiên đăng nhập; chưa đồng bộ thiết bị. Gia sư đã lưu được scope theo account ID; Request dùng shared domain entity và filter learnerId, không lộ private state của account khác.
- Thanh tìm kiếm nhanh nằm dưới hero, không có “Thêm bộ lọc”. Checkbox bên trái chọn nhiều môn, khu vực, thời gian rảnh: OR trong cùng nhóm, AND giữa các nhóm; đồng bộ với thanh lọc nhanh.
- Cột hỗ trợ bên phải Search có chung nền trắng, viền, bo góc và padding với cột lọc trái; chứa map, ba bước và thông tin minh bạch. Khung map mở `/learner/map`, cho chọn hai gia sư để xem vị trí và khoảng cách **minh họa**. Không geolocation, địa chỉ thực, map API hoặc distance ranking.
- Trong My Requests, nút “Tạo yêu cầu mới” chỉ xuất hiện khi mở chi tiết một request và dẫn tới form của đúng gia sư (`/requests/new?tutor=<id>`); không hiển thị ở danh sách `/requests`.

## Auth V4 update (implemented)

- One shared login route `/login` resolves the demo role from the mock auth layer; Login has no role selector. Public registration is learner/parent at `/register` and tutor at `/tutor/register`; Admin has no public registration.
- Demo login and registration state is stored locally in the frontend. Protected product routes share `ProtectedRoute` and enforce the demo role; this is not backend authentication or authorization.
- Protected navigation preserves an internal `redirect` through login and registration. Invalid external/protocol-relative targets fall back to the authenticated role’s default destination. Learner’s current default is defined once as `LEARNER_HOME_PATH = '/learner/search'`.
- If a provider identity is already linked in the mock account data, it logs into that account and resolves its role. New provider identities enter the matching existing registration form; any provider prefill comes only from the explicit mock payload, with absent fields left blank.
- Google’s mock payload contains the approved V4 name and email and marks that email verified. Facebook’s payload contains only the approved V4 name; it does not generate an email or phone. Phone OTP uses `123456`, and a verified phone can be edited, which clears verification.
- After Google/Facebook/Phone verification, the registration page hides the entire quick-registration area and its divider. Password and confirmation remain required for every new account. Tutor subject choices follow the approved list, including DSA and `Khác`, with a conditional custom field.

Tài liệu này là nguồn behavior sản phẩm hiện hành. [`PROJECT_BRIEF.md`](../../PROJECT_BRIEF.md) giữ đề bài gốc; [`SCREEN_INVENTORY.md`](../screens/SCREEN_INVENTORY.md) giữ ID/MVP và mức triển khai; [`ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) giữ routes, source và giới hạn dữ liệu. Không suy ra behavior mới từ archive.

## Phạm vi hiện tại

Tutor class discovery update (2026-10-03): mục “Học viên của tôi” trong sidebar đổi thành “Tìm học viên mới” → protected `/tutor/find-students`. Checkbox môn và khu vực hỗ trợ nhiều lựa chọn (OR trong nhóm, AND giữa nhóm); học phí dùng thanh khoảng hai đầu 0–500.000đ/buổi. Khung giờ lấy trực tiếp các availability range đã Lưu lịch trong workspace, không dùng draft hoặc lesson. Nếu không còn range rảnh sau khi trừ lesson đã đặt, báo lỗi, khóa bộ lọc và dẫn tới `/tutor/timetable` để đăng ký/lưu. Kết quả cập nhật ngay; chỉ request pending có mọi proposal được bao phủ hoàn toàn bởi range rảnh đúng ngày và không trùng lesson mới hiển thị. Trang dùng shared pending request set và detail/accept hiện có, bao gồm request Learner mới tạo; metadata học phí legacy project từ canonical fixture. Không tự tạo nguồn lớp thật, API hoặc dịch vụ matching.

Tutor profile/header update (2026-10-03): header workspace có icon Đăng xuất màu đỏ bên phải username, dùng logout của auth demo và về `/login`. Thời lượng buổi học dùng chung giữa Tutor profile, timetable và Learner: chọn 45 hoặc 90 phút; registration có cùng hai lựa chọn; hồ sơ cũ thiếu trường này mặc định 45 phút. Thời lượng được lưu khi Lưu hồ sơ hoặc Lưu lịch, dùng để xác thực proposal Learner; các lesson đã xác nhận giữ nguyên khoảng thời gian cụ thể.

Tutor teaching levels (2026-10-04): nhóm chọn nhiều cấp độ ngay dưới Môn có thể dạy gồm Mầm Non, Tiểu Học, THCS, THPT, Đại Học. Lưu cùng hồ sơ local và hiển thị trong preview; hồ sơ cũ chưa có trường này mặc định THCS/THPT. Hồ sơ public đọc cùng mutable canonical profile (name/subjects/levels/area/fee/sessionMinutes/bio); `quoc-bao` map demo-tutor, tutor demo khác giữ seed hiện có.

Tutor schedule update: gộp lịch rảnh/lịch dạy ở `/tutor/timetable` trên timeline 7 ngày từ 06:00 đến 24:00. Availability lưu thành các range ngày và phút địa phương; thời điểm bắt đầu muộn nhất là 22:00, thời lượng buổi học dùng chung là 45 hoặc 90 phút. Người dùng thêm, sửa hoặc xóa range rồi bấm Lưu lịch; Hủy thay đổi bỏ draft. Khi gửi yêu cầu Learner chọn trước các proposal cụ thể theo ngày/giờ và thời lượng gia sư; acceptance dùng các ngày/giờ đã gửi, kiểm tra overlap và duplicate accept, rồi trừ lesson khỏi availability. Seed/migration resolve concrete proposals một lần; `requestProposals` chỉ compatibility. Accept dùng ngày/giờ đã lưu, không tính lại tuần. Dashboard period preview và Find Students đều dùng range đã lưu; Find Students chỉ hiện request khi tất cả proposal được bao phủ đầy đủ. Đây là mô phỏng frontend, chưa phải scheduling service hoặc quy tắc matching production.

Tutor lesson detail update (2026-10-04): nhấn lớp trên timetable mở modal giữa màn hình, thay phần chi tiết bên dưới lịch. Modal có môn học, người học, ngày/giờ, địa điểm, trạng thái, ghi chú và action đánh dấu hoàn tất. Lưu ghi chú lưu riêng theo lesson trong workspace local; đánh dấu hoàn tất đồng thời lưu nội dung ghi chú hiện tại và cập nhật trạng thái ngay trong modal. Lớp hoàn tất chuyển sang xám mờ, vẫn mở được để xem/sửa ghi chú; các lớp khác giữ màu hiện có. Modal hỗ trợ ESC, focus trap/return focus và cuộn nội bộ trên màn nhỏ.

Tutor Settings update (2026-10-10): mục Cài đặt hiện có trong sidebar dẫn tới protected `/tutor/settings` qua React Router, dùng TutorShell hiện hành. Thông tin tài khoản dùng mock auth theo account ID; tên/khu vực/phí/hình thức dạy dùng canonical Tutor profile. Tùy chọn vị trí, thông báo và nhận lớp khác lưu localStorage theo account ID để mô phỏng UI; chưa áp thành quy tắc tìm kiếm/matching. Đổi mật khẩu thay mock credential cục bộ; ảnh đại diện chỉ preview trong phiên. Thiết bị đăng nhập, xác thực điện thoại, hỗ trợ và xóa tài khoản là tương tác mô phỏng, không phải dịch vụ thật. Theme toàn app gồm light/dark/system, lựa chọn lưu ở key `theme`; system theo `prefers-color-scheme`, CSS tokens và các màn có hardcoded colors được override cho dark mode. Không có backend cho Settings.

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

Theo yêu cầu user ngày 2026-10-03, Tutor workspace bổ sung `/tutor/map` để xem các lớp đang chờ trên bản đồ minh họa và mở yêu cầu tương ứng. Chỉ dùng mock/local state; vị trí, khoảng cách là dữ liệu demo. Nhà cung cấp Maps API và quy tắc matching thật vẫn UNKNOWN, chưa triển khai.

- Map thật, geocoding, tọa độ thực và distance matching/ranking nâng cao. Landing, Learner map và Tutor map hiện chỉ có bản đồ **minh họa local state**; không dùng map API.
- Realtime chat, learning packages, payment, student-card verification tự động.
- Notification và những màn System Settings, Logs/Permissions chỉ khi được ưu tiên sau core.

Nếu tính năng mới không hỗ trợ trực tiếp core flow, ghi vào backlog trước khi triển khai.

## Từ vựng nghiệp vụ trong mock data

Đề bài nêu `User`, `TutorProfile`, `Subject`, `Location`, `Availability`, `TutoringRequest`, `Review`. Để biểu diễn trạng thái buổi học trong UI, có thể dùng khái niệm `TutoringSession/Lesson`. Một gia sư có thể có nhiều môn/khu vực; các tên `TutorSubject` và `TutorLocation` trong draft cũ chỉ là gợi ý domain **chưa chốt**, không phải bảng dữ liệu. `ChatConversation/Message`, `LearningPackage`, `TutorVerification`, `Notification` là optional. Draft gốc được lưu nguyên văn trong archive.

## Backlog và trạng thái

| Ưu tiên | Việc cần theo dõi |
|---|---|
| Active core batch | Hoàn thiện Learner/Tutor vertical slice theo current behavior và screen inventory; responsive/visual QA; Auth V4 mock frontend flow đã implement. |
| Admin remaining phase | Giữ product flow/inventory cho subject/location/settings/logs chưa triển khai; operational screens đã có không đồng nghĩa toàn bộ Admin completed. |
| Sau core | Map thật, verification mở rộng, chat, gói học, distance matching; không tự đưa vào prototype. |
| Quyết định nghiệp vụ còn mở | Role/auth model, request/lesson lifecycle, tutor approval và location model: chỉ mô phỏng state UI cho đến khi user chốt. |
| Bàn giao môn học | Requirement, user flow, wireframe/UI design, GitHub repository, slide, demo URL. |

Các quyết định còn mở không phải chỉ thị triển khai backend. Canonical seed/state boundary và migration được ghi tại ARCHITECTURE.md. Historical visual reference không override canonical identity hoặc request entity.

## Checklist bàn giao

- [ ] Requirement và user flow nhất quán với screen inventory.
- [ ] Design/wireframe và bản frontend demo có thể mở bằng URL.
- [ ] GitHub repository gọn, README có hướng dẫn chạy và known limitations.
- [ ] Slide trình bày và demo URL.
- [ ] Screenshot hoặc GIF/video ngắn nếu hữu ích.
- [ ] Hướng dẫn demo accounts hiện có (`minhanh`, `giabao`, `admin` / `demo1234`); không có env bắt buộc hoặc auth backend.

## Canonical demo domain — approved Phase B (2026-10-04)

- One immutable temporary fixture `demoReferenceData.js` cung cấp seed/reference. Runtime actions đi qua shared domain provider; components không mutate fixture hoặc tạo second Request store.
- `demo-learner` / minhanh / Nguyễn Minh Anh và `demo-tutor` / giabao / Trần Gia Bảo giữ stable identity. Public Tutor quoc-bao map demo-tutor, location Thủ Đức, Tiếng Anh/IELTS, fee 220000, ĐH Ngoại thương, 4 năm kinh nghiệm theo approved canonical source.
- Learner creates request → Tutor sees chính ID đó → accept/reject phản ánh về Learner. Accept tạo linked Lessons từ concrete proposals, kiểm tra conflict; không resolve lại ngày khi Accept. Submit rechecks future clock và availability.
- Request codes pending/accepted/rejected/cancelled; status text derive. Pending warning, accepted success, rejected/cancelled danger, completed Lesson info. Tutor cancellation không được hiển thị thành rejection.
- Learner chỉ cancel pending request; không tự complete Request. Completion/review availability derive từ linked Lessons. Tutor Complete chỉ confirmed/upcoming → completed; pending/completed/cancelled bị chặn ở UI và action. Ghi chú vẫn editable, completed block xám.
- Functional fee/budget nhất quán VNĐ / buổi; không convert numeric values, không tạo parallel hourlyRate.
- Tutor Dashboard header/greeting/profile summary dùng canonical identity; pending total dùng toàn bộ owned pending requests, cards có thể hiển thị subset. Functional Income dùng shared completed Lessons theo spec bên dưới; progress vẫn là demo illustration.
- Fresh demo/test state seed từ canonical fixture. Legacy keys chỉ migration/compatibility; không xóa key cũ hoặc dùng làm source chính khi v1 tồn tại. Tests reset deterministic clock/state riêng cho mỗi case.
- Tutor đăng ký mới chỉ có dữ liệu user đã nhập; không tự invent rating/experience/formats/levels. Existing profile screen cho chỉnh levels và timetable cho lưu availability. Chưa có input teaching format cho Tutor mới; không thêm màn mới để giải quyết trong batch này.
- Không thay routes/screen IDs, không triển khai Planned screens, Admin, Maps mở rộng hoặc backend. Regression invariants/test pointers nằm trong docs/quality/FRONTEND_REGRESSION_NOTES.md.

## Tutor Income — implemented

- Protected `/tutor/income`, sidebar Thu nhập dùng TutorShell hiện hành. Summary gồm tổng thu nhập tháng, số buổi tạo thu nhập và môn có thu nhập cao nhất (số tiền/số buổi).
- Income là derived projection của shared runtime Lessons: đúng Tutor ID, status completed và sessionFee là số hữu hạn. Tháng theo lesson.date; dùng current/reference date, không khóa vào tháng seed. Không dùng giá hiện tại của Tutor để tính lại lịch sử.
- Mỗi Lesson mới khi Accept snapshot request.sessionFee; fee chưa có giữ unknown. Không tạo Income store hay collection lịch sử riêng. lessonTemplates và historicalLessons chỉ seed vào cùng state.lessons. Restore v1 thêm historical ID còn thiếu, runtime cùng ID thắng; chỉ hydrate fee còn thiếu/null của operational seed có ID khớp template, không overwrite fee runtime.
- Biểu đồ SVG hiển thị 6 tháng lịch gồm tháng hiện tại và 5 tháng trước, zero khi không có thu nhập. Điểm thường xanh Tutor, max đỏ, min success green; ties cùng semantic, max bằng min giữ xanh thường. Có text month/value và nhãn cao/thấp ngoài màu.
- Chi tiết các buổi tạo thu nhập trong tháng gồm ngày, người học, môn, giờ và fee, mới nhất trước. Null learnerId dùng lesson.learner đã có; thiếu thông tin hiển thị unknown, không tạo identity.
- Dashboard total, rows tháng hiện tại và Xem thêm dùng cùng selectors/hooks; Xem thêm mở `/tutor/income`, không còn fixed +12% Income trend. Responsive table chuyển thành rows có label trên mobile.
- Đây là thống kê frontend theo buổi hoàn tất, chưa có thanh toán, số dư hoặc giao dịch thật. Backend Lesson data sau này thay provider/adapter mà không đổi selector/UI.

## Admin reports and appeals — user-approved 2026-10-05

- Dashboard: cột trái đặt **Kiểm duyệt hồ sơ** phía trên **Cần theo dõi / Báo cáo & sự cố**; cột phải giữ lớp học và đánh giá. Khi chuyển một cột trên màn nhỏ, nhóm hồ sơ/báo cáo hiển thị trước, rồi tới lớp học/đánh giá.
- Cả hai tài khoản trong đối soát có nút **Lịch sử báo cáo**: xem báo cáo đã gửi, tổng cảnh cáo đã nhận, lý do, ngày/người xử lý và sự cố liên quan nếu dữ liệu đã có. Không suy warning từ việc chỉ bị báo cáo, không invent lịch sử còn thiếu.
- Learner/Tutor tự gửi tại `/appeals`, chọn đúng sự cố mà mình là bên bị báo cáo; lý do tố cáo oan/hiểu nhầm/hoàn cảnh cần thông cảm, giải trình tối thiểu 20 ký tự, bằng chứng (link hoặc ảnh/PDF), mô tả nguồn và cam kết trung thực bắt buộc. Gửi trùng hồ sơ đang xem xét bị chặn.
- Admin tiếp nhận tại `/admin/appeals`, tìm/lọc và đọc hồ sơ/bằng chứng trong drawer, chuyển đang xem xét hoặc chấp nhận/không chấp nhận cùng căn cứ phản hồi bắt buộc. Người gửi chỉ thấy hồ sơ của mình và xem kết quả sau reload.
- Account suspended có lối xác thực giới hạn dành riêng cho kháng cáo; không unlock Learner/Tutor workspace. Shared login/auth guard chính giữ behavior cũ.
- Acceptance là kết quả xem xét kháng cáo, không tự hủy cảnh cáo hay mở khóa. Policy tác động lên warning/suspension và kiểm chứng bằng chứng thật vẫn UNKNOWN/chưa triển khai.
- Frontend-only: file lưu nội dung trong demo storage, không server upload. Tối đa 3 bằng chứng; mỗi tệp 500 KB, tổng 1 MB. Không tuyên bố dữ liệu đã xác minh hoặc application đã đủ production security.

## Tutor profile and workspace refinements (2026-10-11)

- Tutor profile subjects are selected from a frontend category catalog by ID. Search accepts aliases and Vietnamese accent-insensitive input; an unknown skill may be requested with local PENDING status, without adding it to the selected catalog. Existing public profile subject names remain a display projection of selected IDs.
- Learner groups are independent of subjects. Selecting Mọi độ tuổi replaces narrower groups; selecting a narrower group clears Mọi độ tuổi.
- Tutor profile avatar and front/back CCCD use validated image previews held in the current page session only. CCCD images are private form previews and are never projected to public tutor data. Real upload, review and verification remain future API work.
- Tutor discovery filters combine selected subject, area, fee range and saved availability against shared pending mock requests. Settings keeps teaching formats and request/privacy controls; area and fee remain in Tutor profile.

## Tutor filter, switch and shell follow-up (2026-10-11)

- `Tìm học viên mới` dùng section mở/đóng cho Môn học và Khu vực. Danh mục môn lấy từ subject catalog; khu vực gồm lựa chọn minh họa và khu vực trong shared pending requests. Có thể chọn nhiều, tìm môn, kéo khoảng học phí và reset. Bộ lọc vẫn thao tác được khi chưa lưu lịch rảnh; kết quả cần lịch rảnh đã lưu theo behavior hiện hành.
- Danh sách yêu cầu canonical giữ đúng 9 record theo invariant đã duyệt; không tạo Request store thứ hai chỉ để lấp đầy kết quả lọc. Các lựa chọn chưa có request phù hợp sẽ cho empty state. `Khung giờ đã lưu` mở/đóng bằng details và điều hướng về timetable.
- SettingToggle dùng một native checkbox với role switch và lưu qua settings localStorage hiện có. ON/OFF được phân biệt bằng track, vị trí thumb và aria state trong cả hai theme.
- Dashboard và các trang Tutor dùng chung workspace layout, sidebar width 228px, cùng padding/nav item geometry. Active item chỉ đổi màu và nền.
