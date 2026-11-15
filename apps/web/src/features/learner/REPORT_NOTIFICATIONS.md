# Thông báo báo cáo trong Tin nhắn

Lịch sử thông báo và hội thoại gia sư dùng cùng renderer Learner: bong bóng gọn, gap 8px và 4px khi liên tiếp cùng người gửi trong cùng ngày. Thông báo giữ heading 14px, metadata mã báo cáo/gia sư nhỏ hơn và nội dung công khai. Gom ngày theo timezone trình duyệt; mốc giữa luồng dùng Hôm nay/Hôm qua/dd/MM/yyyy, giờ trong bong bóng HH:mm (24 giờ), thời gian đầy đủ nằm ở thuộc tính time/title. Không có nhãn chung đầu luồng. Tin mẫu chỉ có giờ giữ nguyên giờ, không suy ngày từ ID hoặc nhãn tương đối. Tin gửi mới và intro mới lưu timestamp thực; tin cũ không được backfill ngày giả. Không tạo trạng thái xem xét mới khi nguồn không có event tương ứng.

Frontend-only, projection từ `DemoDomainContext.issues`, không tạo kho báo cáo riêng. Chỉ lấy báo cáo có `reportedBy.id` đúng tài khoản Learner và target Tutor; không suy quyền sở hữu từ tên hoặc email. Thông báo tiếp nhận xuất hiện từ issue đã commit bởi `createTutorReport` sau khi lưu thành công, không lấy draft/toast/form submit.

Mục TutorNearMe ghim đầu danh sách, chỉ đọc, không xóa; lịch sử tăng dần theo thời gian. Read IDs lưu localStorage theo account, nhận diện từng nội dung/kết quả để phản hồi mới có dấu chưa đọc. Khi storage không khả dụng, trạng thái đọc chỉ giữ trong phiên hiện tại. Đây là phân vùng UI prototype, không phải authorization server.

Chỉ `reporterNotice` hiện có được dùng làm nội dung phản hồi. Tuyệt đối không lấy `resolutionNote`, warning reason, evidence hoặc ghi chú admin. Khi resolved/dismissed mà không có public notice, chỉ hiển thị kết quả trung tính, không suy chi tiết xử lý.

Phần còn thiếu để nối sau: action dismiss hiện có ghi `reporterNotice`, nhưng resolve/warn chưa có trường nhập/phát hành phản hồi riêng dành cho Learner; chưa có public response history hoặc timestamp/version riêng cho từng phản hồi. Adapter hiện dùng `updatedAt`/`dismissedAt`/`resolvedAt` của issue cho phản hồi hiện hành; cần public response events có ID, recipient, publishedAt và nội dung đã cho phép công bố để bảo tồn đầy đủ nhiều lần phản hồi. Không sửa domain/Admin ngoài phạm vi Learner.
