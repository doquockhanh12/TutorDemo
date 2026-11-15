# Interface audit — TutorNearMe Learner / Tutor

**Ngày kiểm tra:** 2026-10-04  
**Phạm vi:** kiểm tra giao diện và các tương tác local trên những màn React có layout rõ, đã nối vào hành trình Learner/Parent và Tutor. Admin, mục sidebar ghi “Chưa có màn demo”, placeholder chưa nối flow và mọi yêu cầu backend/API/đồng bộ xuyên tài khoản đều ngoài phạm vi.

## Kết quả chung

Các thao tác đơn vai trò chính phần lớn dễ tìm: Learner lọc gia sư, mở hồ sơ, chọn môn/cấp độ/buổi học, gửi request, theo dõi trạng thái; Tutor xem dashboard, chỉnh hồ sơ/lịch, tìm lớp và phản hồi request. Header Learner và shell sidebar Tutor khác nhau có chủ ý. Hai khu vực vẫn nhận ra cùng một brand nhờ logo, xanh dương làm màu hành động, chữ Nunito, control viền rõ và cách dùng xanh lá cho trạng thái.

Các luồng đơn vai trò đã đi qua được với dữ liệu demo. Vì chưa có backend và hai vai trò dùng các nguồn mock/local riêng, audit này không xem việc request hoặc trạng thái lesson không đồng bộ giữa Learner và Tutor là lỗi UI. Những gì được ghi nhận dưới đây chỉ liên quan nội dung hiển thị, khả năng hiểu thao tác và phản hồi của giao diện trong từng luồng.

## Luồng Learner / Parent

| Screen/state có layout và nối flow | Kết quả dùng thử | Ghi chú |
|---|---|---|
| Shared login `/login` (L01) | Đạt | Một trang đăng nhập, không có role selector; tài khoản demo đưa tới đúng role. |
| Register `/register` (L02) | Đã kiểm tra màn | Form có nhóm thông tin và quick registration; chưa gửi tạo account trong lượt audit. |
| Tutor Search `/learner/search` (L03) và Filters (L04) | Đạt | Tìm/lọc hiện kết quả; kết hợp Toán + Phú Nhuận trả về gia sư khớp. Card dẫn đúng profile; số lượng và sort dễ thấy. |
| Tutor Profile `/tutors/:id` (L05) | Đạt một phần | Nội dung chia nhóm rõ, action chọn nổi bật. Các cấp độ khả dụng khác nhau giữa hồ sơ demo; một số label cũ như “Ôn thi vào 10” không đồng nhất với danh sách cấp độ chuẩn ở Tutor profile. |
| Create Request trong profile (L06) | Đạt | Chọn môn, cấp độ, nhiều buổi và hình thức được đưa vào form. Thiếu cấp độ bị chặn. Submit tới đúng request detail và lưu local. |
| Request confirmation/status (L07 trong L09) | Đạt | Sau submit hiện đúng mã và trạng thái chờ phản hồi. |
| My Requests `/requests` (L08) | Đạt | Danh sách đọc được, các tab lọc theo trạng thái hoạt động. |
| Request Detail `/requests/:id` (L09) | Đạt một phần | Xem các lựa chọn, tạo request mới và hủy request chờ trên mock state. Các trạng thái seeded hiển thị được; đồng bộ với Tutor không thuộc phạm vi UI-only này. |
| Confirmed lesson detail (L10 trong L09) | Có nội dung | Chi tiết lịch được biểu diễn trong request; trạng thái dùng dữ liệu demo của Learner. |
| Submit review (L11 trong L09) | Đạt ở trạng thái seeded | Request hoàn tất mở form sao/nhận xét. Chưa kiểm thử submit để tránh ghi review demo lâu dài. |
| Learner Dashboard `/learner/dashboard` (L12) | Đạt một phần | Có hồ sơ, địa chỉ, saved tutors, request và lịch. Với account vừa thử, địa chỉ trống được giải thích và có nút cập nhật. |
| Nearby Tutor Map (L13) | Implemented `/map` | Search có link “Xem bản đồ”; trang riêng dùng vị trí và khoảng cách minh họa. |
| Learner landing `/learner` | Có trong navigation | Góc phụ huynh liên kết tới landing; không thuộc thao tác cốt lõi sau đăng nhập. |

## Luồng Tutor

| Screen/state có layout và nối flow | Kết quả dùng thử | Ghi chú |
|---|---|---|
| Shared login `/login` (T01) | Đạt | Cùng login Learner; role demo chuyển vào shell Tutor. |
| Tutor register `/tutor/register` (T02) | Có trong navigation | Đường đăng ký được liên kết từ trang public; chưa submit account trong lượt này. |
| Tutor Dashboard `/tutor/dashboard` (T03) | Có lỗi nội dung | Dashboard gọi “Nguyễn Thị Minh Anh”, trong khi header xác định account là “Trần Gia Bảo / giabao”. Danh sách requests trên dashboard 3, badge sidebar 4, inbox thực tế 6 mục; con số trộn có vẻ đến từ các mock source khác nhau. Nên đồng nhất tên và làm rõ mỗi con số đang đếm gì. |
| Tutor Profile `/tutor/profile`, subjects/pricing/location settings (T04–T07) | Đạt một phần | Sửa hồ sơ, chọn nhiều cấp độ và preview/lưu được. Nhưng các trường hồ sơ public của `quoc-bao` chỉ đọc riêng cấp độ lưu; tên, môn, khu vực và phí Tutor chỉnh chưa phản ánh trên Learner search/profile. Người dùng có thể nghĩ hồ sơ đã publish trong khi public listing vẫn dùng một bộ mock data khác. |
| Availability và schedule `/tutor/timetable` (T08/T12) | Đạt | Timeline cho thêm/sửa lịch rảnh và mở lớp để xem chi tiết. Modal mới có ghi chú, trạng thái, nút hoàn tất; thao tác hoàn tất đổi màu lớp. |
| Incoming Requests `/tutor/requests` (T09) | Đạt một phần | Tab trạng thái, search và các request seeded hiển thị được. Không đánh giá việc request Learner có được chuyển sang inbox này hay không. |
| Request Detail `/tutor/requests/:id` (T10) | Đạt với dữ liệu seeded | Mở từ list/map, xem thông tin/thời gian và các action Nhận/Từ chối trên fixture demo. |
| Accept/Reject (T11) | Đạt cục bộ | Có thể thao tác trên request seeded trong Tutor workspace. Kết quả xuyên role không thuộc phạm vi UI-only. |
| Lesson Detail/mark completed (T13/T14) | Đạt cục bộ | Modal mở giữa màn hình, có thông tin lớp và ghi chú. Hoàn tất đổi status/màu trong Tutor timetable. |
| Find Students `/tutor/find-students` (T15) | Đạt về empty state | Bộ lọc môn/khu vực/học phí và lịch hiển thị rõ; có trạng thái 0 kết quả và gợi ý sửa lịch. |
| Tutor Map `/tutor/map` (T16) | Đạt về navigation | Bản đồ minh họa mở detail lớp và ghi rõ khoảng cách/vị trí là demo. Cách phân biệt dữ liệu trên map với kết quả đã lọc ở Tìm học viên mới chưa nổi bật; nên thêm chỉ dẫn ngắn để người dùng hiểu mục đích hai màn. |
| Tutor public landing `/tutor` | Có trong navigation | CTA dẫn tới đăng ký Tutor. Không tính các mục sidebar “Chưa có màn demo” như Thu nhập, Đánh giá, Tin nhắn, Cài đặt thành screen hoạt động. |

## Giao diện và độ nhất quán

- **Learner:** có nhịp marketplace rõ: header ngang, hero, filters, cards, profile và request form. Profile chia cột thông tin/form; trên màn nhỏ các lựa chọn lịch/cuộn bảng có thể tạo trang dài nhưng vẫn giữ target dễ bấm.
- **Tutor:** sidebar và bảng lịch thiên về thao tác công việc. Dashboard có nhiều nguồn nội dung và con số; cần đồng nhất dữ liệu hiển thị với account đăng nhập để người dùng tin các summary.
- **Màu:** hai flow cùng dùng xanh dương cho action/link, nền sáng và xanh lá cho trạng thái. Learner dùng card/hero giàu khoảng trắng; Tutor dùng shell dày thông tin. Khác biệt density/layout phù hợp vai trò, chưa thấy xung đột brand palette rõ rệt.
- **Typography/controls:** chữ và form nhất quán trong các trang đã xem; status có text. Một số phần Learner profile/request dùng card bo tròn nhiều hơn Tutor workspace, nhưng cùng family và không gây nhầm giữa chức năng.
- **Điểm khó hiểu:** “Tìm học viên mới” có zero result trong khi map có lớp; dashboard Tutor chào nhầm persona; Learner thấy thời gian availability khái quát trên card nhưng bảng chỉ cho chọn buổi hoàn chỉnh trong range nên có thể không thấy phần dư ngắn hơn session duration.

## Vấn đề UI cần giữ lại thành regression test

1. Lịch profile Learner của tuần hiện tại vẫn cho chọn các buổi đã qua ngày hiện tại. Người dùng có thể chọn ngày quá khứ làm thời gian mong muốn.

Các kiểm tra giao diện được ghi trong `apps/web/tests/e2e/learner-tutor-interface.spec.js`: mobile overflow trên các màn Learner/Tutor, modal chi tiết lớp và lựa chọn ngày đã qua. Repo hiện không khai báo `@playwright/test` hoặc script E2E nên spec chưa chạy tự động; các luồng chính và lỗi ngày quá khứ đã được kiểm tra trực tiếp trong browser.

## Giới hạn audit

Đây là frontend demo, không đánh giá backend, đồng bộ dữ liệu giữa Learner/Tutor, đồng bộ thiết bị, OAuth thật, bản đồ thật hay bảo mật server. Không sửa giao diện/source ứng dụng trong lượt audit này.
