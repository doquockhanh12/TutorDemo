export const classMaterialsBySubject = {
  'Tiếng Anh': [
    {
      id: 'mat-en-1',
      title: 'Đề cương Ngữ pháp & Từ vựng trọng tâm (Unit 1 - Unit 4)',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '02/10/2026',
      description: 'Tổng hợp cấu trúc câu và 150 từ vựng giao tiếp & IELTS nền tảng theo từng chủ đề.',
      note: 'Học viên đọc trước trang 1–12 trước buổi học thứ Bảy.',
    },
    {
      id: 'mat-en-2',
      title: 'Bài tập luyện phản xạ Speaking & phát âm chuẩn IPA',
      type: 'PDF',
      size: '1.8 MB',
      uploadedAt: '04/10/2026',
      description: 'Danh sách câu hỏi thực hành phản xạ 2 phút và hướng dẫn nhấn trọng âm câu.',
      note: 'Chuẩn bị dàn ý cho 3 chủ đề đầu tiên để thực hành trực tiếp trên lớp.',
    },
  ],
  'Ngữ văn': [
    {
      id: 'mat-van-1',
      title: 'Sơ đồ tư duy Nghị luận xã hội & Phân tích tác phẩm',
      type: 'PDF',
      size: '3.1 MB',
      uploadedAt: '22/09/2026',
      description: 'Hệ thống luận điểm cốt lõi và cách mở bài, kết bài ấn tượng dành cho học sinh phổ thông.',
      note: 'Tài liệu tổng kết sau khi hoàn thành chuyên đề luyện viết.',
    },
  ],
  'Toán': [
    {
      id: 'mat-math-1',
      title: 'Chuyên đề Hàm số & Hình học phẳng trọng tâm',
      type: 'PDF',
      size: '2.9 MB',
      uploadedAt: '01/10/2026',
      description: 'Tóm tắt công thức và các dạng bài tập tự luyện có hướng dẫn giải chi tiết.',
      note: 'Làm bài tập từ câu 1 đến câu 8 trang 5.',
    },
  ],
};

export const fallbackClassRequest = {
        id: 'demo-02',
        tutorId: 'quoc-bao',
        subject: 'Tiếng Anh',
        goal: 'Luyện giao tiếp & phát âm phản xạ',
        schedule: 'Thứ 7 · 09:00',
        format: 'Online / Tại nhà',
        sessionFee: 220000,
        status: 'accepted',
        completed: false,
      };

export const initialClassSubmissions = [
    {
      id: 'sub-1',
      title: 'Bai_tap_ve_nha_Buoi_1_MinhAnh.pdf',
      submittedAt: '03/10/2026 · 20:15',
      status: 'Gia sư đã chấm',
      score: '9.0 / 10',
      feedback: 'Làm bài đầy đủ, nắm vững kiến thức trọng tâm. Chú ý trình bày chi tiết hơn ở câu vận dụng nâng cao.',
    },
    {
      id: 'sub-2',
      title: 'De_cuong_thuc_hanh_Buoi_2_MinhAnh.pdf',
      submittedAt: '06/10/2026 · 19:40',
      status: 'Gia sư đã chấm',
      score: '9.5 / 10',
      feedback: 'Cấu trúc bài làm rất mạch lạc, sử dụng từ vựng và lập luận chính xác. Tiếp tục phát huy nhé!',
    },
  ];
