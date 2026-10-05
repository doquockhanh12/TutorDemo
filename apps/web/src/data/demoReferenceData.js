// Temporary immutable frontend seed. Values migrated from approved current fixtures.
// Runtime actions must clone this data into the domain provider.
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }

  return value;
}

const baseReferenceData = {
  "accounts": [
    {
      "id": "demo-learner",
      "fullName": "Nguyễn Minh Anh",
      "username": "minhanh",
      "email": "learner@demo.tutornearme.vn",
      "phone": "0900000001",
      "role": "learner",
      "status": "active",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "warningCount": 0,
      "warnings": []
    },
    {
      "id": "demo-tutor",
      "fullName": "Trần Gia Bảo",
      "username": "giabao",
      "email": "tutor@demo.tutornearme.vn",
      "phone": "0900000002",
      "role": "tutor",
      "status": "active",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "warningCount": 1,
      "warnings": [
        {
          "id": "warn-demo-1",
          "issueId": "ISSUE-105",
          "reason": "Nhắc nhở về thái độ và phương pháp sư phạm khi giải thích bài",
          "warnedAt": "2026-09-29T15:30:00+07:00",
          "warnedBy": "Quản trị viên"
        }
      ]
    },
    {
      "id": "demo-admin",
      "fullName": "Quản trị viên",
      "username": "admin",
      "email": "admin@demo.tutornearme.vn",
      "phone": "0900000003",
      "role": "admin",
      "status": "active",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      }
    },
    {
      "id": "user-learner-active-2",
      "fullName": "Lê Hoàng Nam",
      "username": "hoangnam",
      "email": "nam.le@demo.tutornearme.vn",
      "phone": "0900000010",
      "role": "learner",
      "accountType": "parent",
      "status": "active",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "address": "Quận 3, TP.HCM",
      "createdAt": "2026-09-01T08:00:00+07:00",
      "warningCount": 0,
      "warnings": []
    },
    {
      "id": "user-tutor-active-2",
      "fullName": "Nguyễn Mai Anh",
      "username": "maianh",
      "email": "maianh.tutor@demo.tutornearme.vn",
      "phone": "0900000011",
      "role": "tutor",
      "status": "active",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "tutorProfileId": "mai-anh",
      "address": "Bình Thạnh, TP.HCM",
      "createdAt": "2026-08-15T09:00:00+07:00",
      "warningCount": 0,
      "warnings": []
    },
    {
      "id": "user-learner-suspended",
      "fullName": "Phạm Quốc Huy",
      "username": "quochuy",
      "email": "quochuy.learner@demo.tutornearme.vn",
      "phone": "0900000012",
      "role": "learner",
      "accountType": "learner",
      "status": "suspended",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "suspendedReason": "Vi phạm chính sách: liên tục đặt lịch và vắng mặt không báo trước nhiều lần.",
      "suspendedAt": "2026-10-02T16:00:00+07:00",
      "createdAt": "2026-09-10T10:00:00+07:00",
      "warningCount": 2,
      "warnings": [
        {
          "id": "warn-qh-1",
          "reason": "Vắng mặt buổi học không báo trước lần 1",
          "warnedAt": "2026-09-25T10:00:00+07:00",
          "warnedBy": "Quản trị viên"
        },
        {
          "id": "warn-qh-2",
          "reason": "Vắng mặt buổi học không báo trước lần 2",
          "warnedAt": "2026-10-01T14:00:00+07:00",
          "warnedBy": "Quản trị viên"
        }
      ]
    },
    {
      "id": "user-tutor-suspended",
      "fullName": "Hoàng Quang Huy",
      "username": "quanghuy",
      "email": "quanghuy.tutor@demo.tutornearme.vn",
      "phone": "0900000013",
      "role": "tutor",
      "status": "suspended",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      },
      "tutorProfileId": "quang-huy",
      "suspendedReason": "Khiếu nại nghiêm trọng: thái độ không chuẩn mực và tự ý hủy lớp có thu phí.",
      "suspendedAt": "2026-10-03T11:00:00+07:00",
      "createdAt": "2026-08-20T14:00:00+07:00",
      "warningCount": 4,
      "warnings": [
        {
          "id": "warn-huy-1",
          "issueId": "ISSUE-101",
          "reason": "Vắng mặt buổi học online không báo trước",
          "warnedAt": "2026-09-15T18:00:00+07:00",
          "warnedBy": "Quản trị viên"
        },
        {
          "id": "warn-huy-2",
          "reason": "Hủy lớp đột xuất sát giờ",
          "warnedAt": "2026-09-22T19:00:00+07:00",
          "warnedBy": "Quản trị viên"
        },
        {
          "id": "warn-huy-3",
          "reason": "Tranh chấp phụ thu học phí",
          "warnedAt": "2026-09-28T14:00:00+07:00",
          "warnedBy": "Quản trị viên"
        },
        {
          "id": "warn-huy-4",
          "issueId": "ISSUE-103",
          "reason": "Hủy buổi học sát giờ hẹn lần 4 (vượt quá 3 lần cảnh cáo)",
          "warnedAt": "2026-10-03T11:00:00+07:00",
          "warnedBy": "Quản trị viên"
        }
      ]
    }
  ],

  "learnerProfiles": [
    {
      "accountId": "demo-learner",
      "savedTutorIds": []
    }
  ],

  "tutorProfiles": [
    {
      "id": "mai-anh",
      "moderationStatus": "approved",
      "name": "Nguyễn Mai Anh",
      "initials": "MA",
      "avatarTone": "blue",
      "schedule": [
        {
          "days": [0, 2, 4],
          "start": "17:00",
          "end": "21:00"
        },
        {
          "days": [5, 6],
          "start": "09:00",
          "end": "12:00"
        }
      ],
      "subjects": [
        "Toán",
        "Vật lý"
      ],
      "location": "Bình Thạnh",
      "availability": [
        "Buổi tối",
        "Buổi sáng",
        "Cuối tuần"
      ],
      "price": 180000,
      "rating": 4.9,
      "reviews": 48,
      "experience": "3 năm kinh nghiệm",
      "university": "ĐH Khoa học Tự nhiên",
      "featured": true,
      "verified": true,
      "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=82",
      "intro": "Giúp học sinh xây nền tảng vững chắc qua cách giải thích gần gũi và lộ trình học rõ ràng.",
      "levels": [
        "THCS",
        "THPT"
      ],
      "approach": "Bắt đầu bằng việc kiểm tra nền tảng, chia nhỏ các dạng bài và luyện tập theo mức độ. Sau mỗi buổi, học viên nhận phần tổng kết và bài tập phù hợp với mục tiêu đang học.",
      "areas": [
        "Bình Thạnh",
        "Phú Nhuận"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "THCS",
        "THPT",
        "Ôn thi vào 10"
      ],
      "sessionMinutes": 90,
      "legacyDuration": 90
    },

    {
      "id": "quoc-bao",
      "moderationStatus": "approved",
      "accountId": "demo-tutor",
      "name": "Trần Gia Bảo",
      "initials": "GB",
      "avatarTone": "coral",
      "schedule": [
        {
          "days": [1, 3, 4],
          "start": "18:00",
          "end": "21:00"
        },
        {
          "days": [5],
          "start": "09:00",
          "end": "12:00"
        }
      ],
      "subjects": [
        "Tiếng Anh",
        "IELTS"
      ],
      "location": "Thủ Đức",
      "availability": [
        "Buổi tối",
        "Buổi sáng",
        "Cuối tuần"
      ],
      "price": 220000,
      "rating": 4.9,
      "reviews": 36,
      "experience": "4 năm kinh nghiệm",
      "university": "ĐH Ngoại thương",
      "featured": false,
      "verified": true,
      "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=82",
      "intro": "Tập trung phản xạ giao tiếp và phương pháp tự học để học viên tiến bộ bền vững.",
      "levels": [
        "THCS",
        "THPT"
      ],
      "approach": "Kết hợp luyện nghe, giao tiếp và sửa bài trực tiếp. Xây dựng thói quen tự học với bài tập ngắn, theo dõi những lỗi thường gặp và phản hồi sau từng buổi.",
      "areas": [
        "Thủ Đức",
        "Bình Thạnh"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "THCS",
        "THPT",
        "IELTS nền tảng"
      ],
      "sessionMinutes": 45,
      "legacyDuration": 90
    },

    {
      "id": "ha-linh",
      "moderationStatus": "approved",
      "name": "Phạm Hà Linh",
      "initials": "HL",
      "avatarTone": "yellow",
      "schedule": [
        {
          "days": [0, 2, 4],
          "start": "13:00",
          "end": "17:00"
        },
        {
          "days": [5, 6],
          "start": "09:00",
          "end": "12:00"
        }
      ],
      "subjects": [
        "Ngữ văn",
        "Tiếng Anh"
      ],
      "location": "Quận 3",
      "availability": [
        "Buổi chiều",
        "Buổi sáng",
        "Cuối tuần"
      ],
      "price": 160000,
      "rating": 4.8,
      "reviews": 29,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH Sư phạm TP.HCM",
      "featured": false,
      "verified": true,
      "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=82",
      "intro": "Biến bài học thành cuộc trò chuyện dễ hiểu, khuyến khích học viên đặt câu hỏi.",
      "levels": [
        "THCS",
        "THPT"
      ],
      "approach": "Hướng dẫn đọc hiểu, lập dàn ý và thực hành diễn đạt qua từng bài. Với ngoại ngữ, ưu tiên củng cố kiến thức trên lớp và luyện tập theo tình huống gần gũi.",
      "areas": [
        "Quận 3",
        "Phú Nhuận"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "THCS",
        "THPT"
      ],
      "sessionMinutes": 90,
      "legacyDuration": 90
    },

    {
      "id": "duc-minh",
      "moderationStatus": "approved",
      "name": "Lê Đức Minh",
      "initials": "ĐM",
      "avatarTone": "cyan",
      "schedule": [
        {
          "days": [1, 3],
          "start": "13:00",
          "end": "17:00"
        },
        {
          "days": [0, 2, 4],
          "start": "17:00",
          "end": "21:00"
        }
      ],
      "subjects": [
        "Toán",
        "Hóa học"
      ],
      "location": "Phú Nhuận",
      "availability": [
        "Buổi chiều",
        "Buổi tối"
      ],
      "price": 170000,
      "rating": 4.8,
      "reviews": 31,
      "experience": "3 năm kinh nghiệm",
      "university": "ĐH Bách khoa TP.HCM",
      "featured": false,
      "verified": true,
      "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=82",
      "intro": "Hướng dẫn từng bước và luyện tập theo mức độ, phù hợp học sinh cần củng cố kiến thức.",
      "levels": [
        "THCS",
        "THPT"
      ],
      "approach": "Giải thích nguyên lý trước khi áp dụng công thức. Luyện bài từ cơ bản đến nâng cao, giúp học viên hiểu cách làm và tự kiểm tra kết quả.",
      "areas": [
        "Phú Nhuận",
        "Bình Thạnh"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "THCS",
        "THPT",
        "Ôn tập kiểm tra"
      ],
      "sessionMinutes": 45,
      "legacyDuration": 120
    },

    {
      "id": "thu-trang",
      "moderationStatus": "approved",
      "name": "Võ Thu Trang",
      "initials": "TT",
      "avatarTone": "violet",
      "schedule": [
        {
          "days": [0, 2, 4, 5, 6],
          "start": "08:00",
          "end": "12:00"
        }
      ],
      "subjects": [
        "Tiếng Anh",
        "Ngữ văn"
      ],
      "location": "Bình Thạnh",
      "availability": [
        "Buổi sáng",
        "Cuối tuần"
      ],
      "price": 190000,
      "rating": 4.7,
      "reviews": 22,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH Sư phạm TP.HCM",
      "featured": false,
      "verified": true,
      "image": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=82",
      "intro": "Lớp học cởi mở, chú trọng thực hành và ghi nhận tiến bộ qua từng buổi.",
      "levels": [
        "Tiểu Học",
        "THCS"
      ],
      "approach": "Tạo không gian học cởi mở với hoạt động thực hành và phản hồi cụ thể. Mục tiêu được chia thành các bước nhỏ để học viên dễ theo dõi tiến bộ.",
      "areas": [
        "Bình Thạnh"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "Tiểu học",
        "THCS"
      ],
      "sessionMinutes": 45,
      "legacyDuration": 60
    },

    {
      "id": "gia-huy",
      "moderationStatus": "approved",
      "name": "Đặng Gia Huy",
      "initials": "GH",
      "avatarTone": "slate",
      "schedule": [
        {
          "days": [1, 3, 4],
          "start": "19:00",
          "end": "21:00"
        }
      ],
      "subjects": [
        "Vật lý",
        "Toán"
      ],
      "location": "Thủ Đức",
      "availability": [
        "Buổi tối"
      ],
      "price": 150000,
      "rating": 4.7,
      "reviews": 18,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH Khoa học Tự nhiên",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=600&q=82",
      "intro": "Liên hệ kiến thức với tình huống thực tế để các công thức trở nên dễ nhớ hơn.",
      "levels": [
        "THCS",
        "THPT"
      ],
      "approach": "Liên hệ bài học với tình huống thực tế, sử dụng ví dụ trực quan và luyện tập từng bước. Ưu tiên củng cố nền tảng trước khi học dạng bài khó hơn.",
      "areas": [
        "Thủ Đức"
      ],
      "formats": [
        "Tại nhà",
        "Online"
      ],
      "legacyLevels": [
        "THCS",
        "THPT"
      ],
      "sessionMinutes": 90,
      "legacyDuration": 90
    },

    {
      "id": "thao-vy",
      "moderationStatus": "pending",
      "status": "pending",
      "name": "Lê Thảo Vy",
      "initials": "TV",
      "avatarTone": "violet",
      "schedule": [
        {
          "days": [1, 3, 5],
          "start": "18:00",
          "end": "21:00"
        }
      ],
      "subjects": ["Tiếng Anh"],
      "location": "Quận 1",
      "areas": ["Quận 1", "Quận 3"],
      "availability": ["Buổi tối"],
      "price": 160000,
      "rating": 5.0,
      "reviews": 0,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH Sư phạm TP.HCM",
      "school": "ĐH Sư phạm TP.HCM",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=82",
      "intro": "Sinh viên năm cuối ĐH Sư phạm TP.HCM, chứng chỉ IELTS 8.0, 2 năm kinh nghiệm luyện đề và giao tiếp.",
      "levels": ["THPT", "Luyện thi đại học", "IELTS"],
      "approach": "Tập trung phản xạ giao tiếp và phương pháp xử lý bẫy trong đề thi thực tế.",
      "formats": ["Online", "Tại nhà"],
      "sessionMinutes": 90,
      "submittedAt": "2026-10-04T09:20:00+07:00",
      "submitted": "Hôm nay, 09:20",
      "documents": [
        {
          "id": "doc-1",
          "title": "Thẻ sinh viên",
          "type": "student_card",
          "file": "the_sv_hcmue.jpg",
          "issuedBy": "Trường ĐH Sư phạm TP.HCM",
          "number": "46.01.701.082",
          "fileType": "JPG",
          "fileSize": "1.8 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        },
        {
          "id": "doc-2",
          "title": "CCCD",
          "type": "id_card",
          "file": "cccd_lethaovy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079198001234",
          "fileType": "PDF",
          "fileSize": "2.4 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        }
      ],
      "verificationDocuments": [
        {
          "id": "doc-1",
          "title": "Thẻ sinh viên",
          "type": "student_card",
          "file": "the_sv_hcmue.jpg",
          "issuedBy": "Trường ĐH Sư phạm TP.HCM",
          "number": "46.01.701.082",
          "fileType": "JPG",
          "fileSize": "1.8 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        },
        {
          "id": "doc-2",
          "title": "CCCD",
          "type": "id_card",
          "file": "cccd_lethaovy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079198001234",
          "fileType": "PDF",
          "fileSize": "2.4 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        }
      ],
      "verificationDocs": [
        {
          "id": "doc-1",
          "title": "Thẻ sinh viên",
          "type": "student_card",
          "file": "the_sv_hcmue.jpg",
          "issuedBy": "Trường ĐH Sư phạm TP.HCM",
          "number": "46.01.701.082",
          "fileType": "JPG",
          "fileSize": "1.8 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        },
        {
          "id": "doc-2",
          "title": "CCCD",
          "type": "id_card",
          "file": "cccd_lethaovy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079198001234",
          "fileType": "PDF",
          "fileSize": "2.4 MB",
          "uploadedAt": "2026-10-04T09:20:00+07:00",
          "status": "verified",
          "verified": true
        }
      ]
    },

    {
      "id": "hoang-phuc",
      "moderationStatus": "pending",
      "status": "pending",
      "name": "Nguyễn Hoàng Phúc",
      "initials": "HP",
      "avatarTone": "blue",
      "schedule": [
        {
          "days": [2, 4, 6],
          "start": "17:30",
          "end": "20:30"
        }
      ],
      "subjects": ["Toán", "Vật lý"],
      "location": "Quận 10",
      "areas": ["Quận 10", "Quận 5"],
      "availability": ["Buổi tối"],
      "price": 200000,
      "rating": 5.0,
      "reviews": 0,
      "experience": "1.5 năm kinh nghiệm",
      "university": "ĐH Bách khoa TP.HCM",
      "school": "ĐH Bách khoa TP.HCM",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=82",
      "intro": "Sinh viên Kỹ thuật ĐH Bách khoa, đạt giải Nhì học sinh giỏi môn Vật lý, chuyên kèm bồi dưỡng lớp 9 lên 10.",
      "levels": ["THCS", "THPT"],
      "approach": "Hệ thống hóa lý thuyết bằng sơ đồ tư duy và rèn luyện tư duy giải nhanh toán lý.",
      "formats": ["Online", "Tại nhà"],
      "sessionMinutes": 90,
      "submittedAt": "2026-10-04T08:45:00+07:00",
      "submitted": "Hôm nay, 08:45",
      "documents": [
        {
          "id": "doc-hp-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_nguyenhoangphuc.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079199005678",
          "fileType": "PDF",
          "fileSize": "2.1 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-hp-2",
          "title": "Thẻ sinh viên ĐH Bách Khoa",
          "type": "student_card",
          "file": "the_sv_bachkhoa.jpg",
          "issuedBy": "ĐH Bách khoa - ĐHQG TP.HCM",
          "number": "2113456",
          "fileType": "JPG",
          "fileSize": "1.5 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "pending"
        }
      ],
      "verificationDocuments": [
        {
          "id": "doc-hp-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_nguyenhoangphuc.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079199005678",
          "fileType": "PDF",
          "fileSize": "2.1 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-hp-2",
          "title": "Thẻ sinh viên ĐH Bách Khoa",
          "type": "student_card",
          "file": "the_sv_bachkhoa.jpg",
          "issuedBy": "ĐH Bách khoa - ĐHQG TP.HCM",
          "number": "2113456",
          "fileType": "JPG",
          "fileSize": "1.5 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "pending"
        }
      ],
      "verificationDocs": [
        {
          "id": "doc-hp-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_nguyenhoangphuc.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079199005678",
          "fileType": "PDF",
          "fileSize": "2.1 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-hp-2",
          "title": "Thẻ sinh viên ĐH Bách Khoa",
          "type": "student_card",
          "file": "the_sv_bachkhoa.jpg",
          "issuedBy": "ĐH Bách khoa - ĐHQG TP.HCM",
          "number": "2113456",
          "fileType": "JPG",
          "fileSize": "1.5 MB",
          "uploadedAt": "2026-10-04T08:45:00+07:00",
          "status": "pending"
        }
      ]
    },

    {
      "id": "minh-chau",
      "moderationStatus": "pending",
      "status": "pending",
      "name": "Trần Minh Châu",
      "initials": "MC",
      "avatarTone": "yellow",
      "schedule": [
        {
          "days": [0, 2],
          "start": "18:30",
          "end": "21:00"
        }
      ],
      "subjects": ["Ngữ văn"],
      "location": "Bình Thạnh",
      "areas": ["Bình Thạnh", "Gò Vấp"],
      "availability": ["Buổi tối"],
      "price": 170000,
      "rating": 5.0,
      "reviews": 0,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH KHXH&NV",
      "school": "ĐH KHXH&NV",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=82",
      "intro": "Cử nhân Sư phạm Văn, phương pháp sơ đồ tư duy giúp học sinh nắm vững luận điểm nghị luận xã hội và văn học.",
      "levels": ["THCS", "THPT"],
      "approach": "Phát triển tư duy phân tích độc lập và khả năng lập dàn ý mạch lạc, sâu sắc.",
      "formats": ["Tại nhà", "Online"],
      "sessionMinutes": 90,
      "submittedAt": "2026-10-03T16:30:00+07:00",
      "submitted": "Hôm qua, 16:30",
      "documents": [
        {
          "id": "doc-mc-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_tranminhchau.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079197003456",
          "fileType": "PDF",
          "fileSize": "2.2 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-mc-2",
          "title": "Bằng Cử nhân Sư phạm Ngữ văn",
          "type": "degree",
          "file": "bang_tot_nghiep_ussh.pdf",
          "issuedBy": "ĐH KHXH&NV TP.HCM",
          "number": "DH-2024-NV092",
          "fileType": "PDF",
          "fileSize": "3.5 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "pending"
        }
      ],
      "verificationDocuments": [
        {
          "id": "doc-mc-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_tranminhchau.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079197003456",
          "fileType": "PDF",
          "fileSize": "2.2 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-mc-2",
          "title": "Bằng Cử nhân Sư phạm Ngữ văn",
          "type": "degree",
          "file": "bang_tot_nghiep_ussh.pdf",
          "issuedBy": "ĐH KHXH&NV TP.HCM",
          "number": "DH-2024-NV092",
          "fileType": "PDF",
          "fileSize": "3.5 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "pending"
        }
      ],
      "verificationDocs": [
        {
          "id": "doc-mc-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_tranminhchau.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "number": "079197003456",
          "fileType": "PDF",
          "fileSize": "2.2 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-mc-2",
          "title": "Bằng Cử nhân Sư phạm Ngữ văn",
          "type": "degree",
          "file": "bang_tot_nghiep_ussh.pdf",
          "issuedBy": "ĐH KHXH&NV TP.HCM",
          "number": "DH-2024-NV092",
          "fileType": "PDF",
          "fileSize": "3.5 MB",
          "uploadedAt": "2026-10-03T16:30:00+07:00",
          "status": "pending"
        }
      ]
    },

    {
      "id": "tuan-anh",
      "moderationStatus": "rejected",
      "status": "rejected",
      "name": "Nguyễn Tuấn Anh",
      "initials": "TA",
      "avatarTone": "coral",
      "rejectionReason": "Bằng cấp chuyên ngành và hồ sơ căn cước chưa đầy đủ thông tin đối chiếu.",
      "rejectedAt": "2026-10-02T14:10:00+07:00",
      "schedule": [],
      "subjects": ["Toán", "Tin học"],
      "location": "Quận 8",
      "areas": ["Quận 8"],
      "availability": ["Buổi tối"],
      "price": 150000,
      "rating": null,
      "reviews": 0,
      "experience": "1 năm kinh nghiệm",
      "university": "ĐH Công nghệ Sài Gòn",
      "school": "ĐH Công nghệ Sài Gòn",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=82",
      "intro": "Chuyên kèm Toán căn bản và Tin học văn phòng cho học sinh cấp 2.",
      "levels": ["THCS"],
      "approach": "Luyện tập thực hành từng bước từ cơ bản đến nâng cao.",
      "formats": ["Tại nhà"],
      "sessionMinutes": 90,
      "submittedAt": "2026-10-01T10:00:00+07:00",
      "submitted": "01/10/2026",
      "documents": [
        {
          "id": "doc-ta-1",
          "title": "Căn cước công dân (ảnh mờ)",
          "type": "id_card",
          "file": "cccd_nguyentuananh.jpg",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "JPG",
          "fileSize": "1.2 MB",
          "uploadedAt": "2026-10-01T10:00:00+07:00",
          "status": "rejected"
        }
      ],
      "verificationDocuments": [
        {
          "id": "doc-ta-1",
          "title": "Căn cước công dân (ảnh mờ)",
          "type": "id_card",
          "file": "cccd_nguyentuananh.jpg",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "JPG",
          "fileSize": "1.2 MB",
          "uploadedAt": "2026-10-01T10:00:00+07:00",
          "status": "rejected"
        }
      ],
      "verificationDocs": [
        {
          "id": "doc-ta-1",
          "title": "Căn cước công dân (ảnh mờ)",
          "type": "id_card",
          "file": "cccd_nguyentuananh.jpg",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "JPG",
          "fileSize": "1.2 MB",
          "uploadedAt": "2026-10-01T10:00:00+07:00",
          "status": "rejected"
        }
      ]
    },

    {
      "id": "quang-huy",
      "accountId": "user-tutor-suspended",
      "moderationStatus": "suspended",
      "status": "suspended",
      "name": "Hoàng Quang Huy",
      "initials": "QH",
      "avatarTone": "slate",
      "suspendedReason": "Khiếu nại nghiêm trọng: hủy buổi học đột xuất không hoàn phí và thái độ không phù hợp.",
      "suspendedAt": "2026-10-03T11:00:00+07:00",
      "schedule": [
        {
          "days": [1, 3],
          "start": "19:00",
          "end": "21:00"
        }
      ],
      "subjects": ["Toán", "Tiếng Anh"],
      "location": "Quận 7",
      "areas": ["Quận 7"],
      "availability": ["Buổi tối"],
      "price": 160000,
      "rating": 3.8,
      "reviews": 12,
      "experience": "2 năm kinh nghiệm",
      "university": "ĐH Kinh tế TP.HCM",
      "school": "ĐH Kinh tế TP.HCM",
      "featured": false,
      "verified": false,
      "image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=82",
      "intro": "Kèm Toán và Tiếng Anh cơ bản cho học sinh lớp 6 đến lớp 9.",
      "levels": ["THCS"],
      "approach": "Luyện đề theo chuyên đề bám sát sách giáo khoa.",
      "formats": ["Online", "Tại nhà"],
      "sessionMinutes": 90,
      "submittedAt": "2026-08-20T14:00:00+07:00",
      "submitted": "20/08/2026",
      "documents": [
        {
          "id": "doc-qh-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_hoangquanghuy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "PDF",
          "fileSize": "2.0 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-qh-2",
          "title": "Thẻ sinh viên ĐH Kinh tế",
          "type": "student_card",
          "file": "the_sv_ueh.jpg",
          "issuedBy": "ĐH Kinh tế TP.HCM",
          "fileType": "JPG",
          "fileSize": "1.7 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        }
      ],
      "verificationDocuments": [
        {
          "id": "doc-qh-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_hoangquanghuy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "PDF",
          "fileSize": "2.0 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-qh-2",
          "title": "Thẻ sinh viên ĐH Kinh tế",
          "type": "student_card",
          "file": "the_sv_ueh.jpg",
          "issuedBy": "ĐH Kinh tế TP.HCM",
          "fileType": "JPG",
          "fileSize": "1.7 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        }
      ],
      "verificationDocs": [
        {
          "id": "doc-qh-1",
          "title": "Căn cước công dân (2 mặt)",
          "type": "id_card",
          "file": "cccd_hoangquanghuy.pdf",
          "issuedBy": "Cục CSQLHC về TTXH",
          "fileType": "PDF",
          "fileSize": "2.0 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        },
        {
          "id": "doc-qh-2",
          "title": "Thẻ sinh viên ĐH Kinh tế",
          "type": "student_card",
          "file": "the_sv_ueh.jpg",
          "issuedBy": "ĐH Kinh tế TP.HCM",
          "fileType": "JPG",
          "fileSize": "1.7 MB",
          "uploadedAt": "2026-08-20T14:00:00+07:00",
          "status": "verified"
        }
      ]
    }
  ],

  "requests": [
    {
      "id": "demo-01",
      "tutorId": "mai-anh",
      "subject": "Toán",
      "goal": "Củng cố kiến thức lớp 9",
      "schedule": "Thứ 3 · 18:00",
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "sessionFee": 180000,
      "status": "pending"
    },
    {
      "id": "demo-02",
      "tutorId": "quoc-bao",
      "subject": "Tiếng Anh",
      "goal": "Luyện giao tiếp",
      "schedule": "Thứ 7 · 09:00",
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "sessionFee": 220000,
      "status": "accepted"
    },
    {
      "id": "demo-03",
      "tutorId": "ha-linh",
      "subject": "Ngữ văn",
      "goal": "Luyện viết",
      "schedule": "Thứ 5 · 19:00",
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "sessionFee": 160000,
      "status": "accepted",
      "legacyLessonStatus": "completed"
    },

    {
      "id": "req-1",
      "learner": "Phụ huynh bé An",
      "initials": "PA",
      "subject": "Toán lớp 8",
      "area": "Bình Thạnh",
      "schedule": "Tối thứ 3, 5",
      "note": "Muốn củng cố kiến thức học kỳ I.",
      "received": "2 giờ trước",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 180000,
      "proposalTemplate": {
        "days": [1, 3],
        "start": 1095,
        "end": 1185
      },
      "catalogSubject": "Toán"
    },

    {
      "id": "req-2",
      "learner": "Nguyễn Khánh Linh",
      "initials": "KL",
      "subject": "Vật lý lớp 10",
      "area": "Thủ Đức",
      "schedule": "Chiều cuối tuần",
      "note": "Cần hỗ trợ phần điện học.",
      "received": "5 giờ trước",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 200000,
      "proposalTemplate": {
        "days": [5],
        "start": 780,
        "end": 870
      },
      "catalogSubject": "Vật lý"
    },

    {
      "id": "req-3",
      "learner": "Phụ huynh bé Nam",
      "initials": "PN",
      "subject": "Toán lớp 9",
      "area": "Quận 3",
      "schedule": "Tối thứ 2, 4",
      "note": "Ôn tập trước kỳ thi chuyển cấp.",
      "received": "Hôm qua",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 220000,
      "proposalTemplate": {
        "days": [0, 2],
        "start": 1140,
        "end": 1230
      },
      "catalogSubject": "Toán"
    },

    {
      "id": "ref-1",
      "subject": "Toán",
      "tone": "blue",
      "learner": "Học sinh lớp 9",
      "area": "Cầu Giấy, Hà Nội",
      "distance": "1.2 km",
      "fee": "200.000đ/buổi",
      "note": "Ôn thi vào lớp 10, củng cố kiến thức và luyện đề.",
      "schedule": "Thứ 2, 4, 6 (19:00 - 21:00)",
      "parent": "Nguyễn Văn Nam",
      "received": "2 giờ trước",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 200000,
      "proposalTemplate": {
        "days": [0, 2, 4],
        "start": 1140,
        "end": 1230
      }
    },

    {
      "id": "ref-2",
      "subject": "Tiếng Anh",
      "tone": "green",
      "learner": "Học sinh lớp 7",
      "area": "Đống Đa, Hà Nội",
      "distance": "2.5 km",
      "fee": "180.000đ/buổi",
      "note": "Cải thiện giao tiếp, phát âm và ngữ pháp cơ bản.",
      "schedule": "Thứ 3, 5 (18:00 - 20:00)",
      "parent": "Lê Phương Anh",
      "received": "4 giờ trước",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 180000,
      "proposalTemplate": {
        "days": [1, 3],
        "start": 1095,
        "end": 1185
      }
    },

    {
      "id": "ref-3",
      "subject": "Vật lý",
      "tone": "violet",
      "learner": "Học sinh lớp 11",
      "area": "Thanh Xuân, Hà Nội",
      "distance": "3.1 km",
      "fee": "220.000đ/buổi",
      "note": "Ôn thi học kỳ, giải đề và nâng cao kiến thức.",
      "schedule": "Thứ 7, Chủ nhật (14:00 - 16:00)",
      "parent": "Trần Minh Đức",
      "received": "6 giờ trước",
      "status": "pending",
      "tutorId": "quoc-bao",
      "learnerId": null,
      "sessionFee": 220000,
      "proposalTemplate": {
        "days": [5, 6],
        "start": 870,
        "end": 960
      }
    }
  ],

  "lessonTemplates": [
    {
      "start": 420,
      "end": 465,
      "subject": "Toán",
      "learner": "N.M.A",
      "status": "confirmed",
      "id": "seed-0",
      "tutorId": "quoc-bao",
      "place": "Địa điểm minh họa",
      "sessionFee": 220000,
      "day": 1
    },
    {
      "start": 510,
      "end": 555,
      "subject": "Tiếng Anh",
      "learner": "P.K",
      "status": "upcoming",
      "id": "seed-1",
      "tutorId": "quoc-bao",
      "place": "Địa điểm minh họa",
      "sessionFee": 220000,
      "day": 3
    },
    {
      "start": 780,
      "end": 825,
      "subject": "Vật lý",
      "learner": "H.N",
      "status": "pending",
      "id": "seed-2",
      "tutorId": "quoc-bao",
      "place": "Địa điểm minh họa",
      "sessionFee": 220000,
      "day": 4
    },
    {
      "start": 870,
      "end": 915,
      "subject": "Toán",
      "learner": "L.A",
      "status": "confirmed",
      "id": "seed-3",
      "tutorId": "quoc-bao",
      "place": "Địa điểm minh họa",
      "sessionFee": 220000,
      "day": 2
    },
    {
      "start": 1005,
      "end": 1050,
      "subject": "Tiếng Anh",
      "learner": "M.K",
      "status": "confirmed",
      "id": "seed-4",
      "tutorId": "quoc-bao",
      "place": "Địa điểm minh họa",
      "sessionFee": 220000,
      "day": 5
    }
  ],

  "historicalLessons": [
    {
      "id": "history-lesson-2026-05-09-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Ngọc Lan",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-05-09",
      "start": 540,
      "end": 585,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 180000,
      "completedAt": "2026-05-09T09:45:00+07:00"
    },

    {
      "id": "history-lesson-2026-06-06-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-06-06",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 180000,
      "completedAt": "2026-06-06T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-06-20-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Học sinh THPT",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-06-20",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Online",
      "area": "Bình Thạnh",
      "place": "Online",
      "sessionFee": 180000,
      "completedAt": "2026-06-20T19:45:00+07:00"
    },

    {
      "id": "history-lesson-2026-07-03-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-07-03",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 200000,
      "completedAt": "2026-07-03T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-07-17-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Quỳnh Trang",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-07-17",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Tại nhà",
      "area": "Thủ Đức",
      "place": "Thủ Đức",
      "sessionFee": 200000,
      "completedAt": "2026-07-17T19:45:00+07:00"
    },

    {
      "id": "history-lesson-2026-08-07-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Ngọc Lan",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-08-07",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 200000,
      "completedAt": "2026-08-07T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-08-15-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Học sinh THPT",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-08-15",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Online",
      "area": "Bình Thạnh",
      "place": "Online",
      "sessionFee": 200000,
      "completedAt": "2026-08-15T19:45:00+07:00"
    },
    {
      "id": "history-lesson-review-3",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Quỳnh Trang",
      "subject": "Tiếng Anh",
      "level": "THPT",
      "date": "2026-08-28",
      "start": 540,
      "end": 585,
      "status": "completed",
      "format": "Tại nhà",
      "area": "Thủ Đức",
      "place": "Thủ Đức",
      "sessionFee": 220000,
      "completedAt": "2026-08-28T09:45:00+07:00"
    },

    {
      "id": "history-lesson-review-2",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Học sinh THPT",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-09-05",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Online",
      "area": "Bình Thạnh",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-09-05T19:45:00+07:00"
    },
    {
      "id": "history-lesson-review-1",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Ngọc Lan",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-09-12",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-09-12T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-09-20-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-09-20",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-09-20T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-09-27-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-09-27",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Online",
      "area": "Bình Thạnh",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-09-27T19:45:00+07:00"
    },

    {
      "id": "history-lesson-2026-10-01-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": "demo-learner",
      "learner": "Nguyễn Minh Anh",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-10-01",
      "start": 1080,
      "end": 1125,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-10-01T18:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-10-02-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Học sinh THPT",
      "subject": "IELTS",
      "level": "THPT",
      "date": "2026-10-02",
      "start": 1140,
      "end": 1185,
      "status": "completed",
      "format": "Online",
      "area": "Bình Thạnh",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-10-02T19:45:00+07:00"
    },
    {
      "id": "history-lesson-2026-10-03-01",
      "tutorId": "quoc-bao",
      "requestId": null,
      "learnerId": null,
      "learner": "Ngọc Lan",
      "subject": "Tiếng Anh",
      "level": "THCS",
      "date": "2026-10-03",
      "start": 540,
      "end": 585,
      "status": "completed",
      "format": "Online",
      "area": "Thủ Đức",
      "place": "Online",
      "sessionFee": 220000,
      "completedAt": "2026-10-03T09:45:00+07:00"
    }
  ],

  "reviews": [
    {
      "id": "review-1",

      "tutorId": "quoc-bao",
      "lessonId": "history-lesson-review-1",
      "requestId": null,
      "learnerId": null,

      "reviewerType": "learner",

      "name": "Ngọc Lan",
      "initials": "NL",

      "rating": 5,
      "text": "Giải thích dễ hiểu, chuẩn bị bài kỹ và hướng dẫn rất kiên nhẫn.",

      "date": "12/09/2026",
      "createdAt": "2026-09-12T20:05:00+07:00",

      "visibility": "public",
      "moderationStatus": "approved",

      "lessonSnapshot": {
        "subject": "Tiếng Anh",
        "level": "THCS",

        "learnerName": "Ngọc Lan",

        "date": "2026-09-12",
        "start": 1080,
        "end": 1125,
        "durationMinutes": 45,

        "format": "Online",
        "area": "Thủ Đức",

        "sessionFee": 220000
      }
    },

    {
      "id": "review-2",

      "tutorId": "quoc-bao",
      "lessonId": "history-lesson-review-2",
      "requestId": null,
      "learnerId": null,

      "reviewerType": "parent",

      "name": "Hoàng Minh",
      "initials": "HM",

      "rating": 5,
      "text": "Lịch học rõ ràng, bài tập vừa sức và có phản hồi sau mỗi buổi.",

      "date": "05/09/2026",
      "createdAt": "2026-09-05T21:10:00+07:00",

      "visibility": "public",
      "moderationStatus": "approved",

      "lessonSnapshot": {
        "subject": "IELTS",
        "level": "THPT",

        "learnerName": "Học sinh THPT",

        "date": "2026-09-05",
        "start": 1140,
        "end": 1185,
        "durationMinutes": 45,

        "format": "Online",
        "area": "Bình Thạnh",

        "sessionFee": 220000
      }
    },

    {
      "id": "review-3",

      "tutorId": "quoc-bao",
      "lessonId": "history-lesson-review-3",
      "requestId": null,
      "learnerId": null,

      "reviewerType": "learner",

      "name": "Quỳnh Trang",
      "initials": "QT",

      "rating": 4,
      "text": "Cách học gần gũi, giúp mình tự tin đặt câu hỏi hơn.",

      "date": "28/08/2026",
      "createdAt": "2026-08-28T11:15:00+07:00",

      "visibility": "public",
      "moderationStatus": "approved",

      "lessonSnapshot": {
        "subject": "Tiếng Anh",
        "level": "THPT",

        "learnerName": "Quỳnh Trang",

        "date": "2026-08-28",
        "start": 540,
        "end": 585,
        "durationMinutes": 45,

        "format": "Tại nhà",
        "area": "Thủ Đức",

        "sessionFee": 220000
      }
    }
  ],

  "subjects": [
    "Toán",
    "Ngữ văn",
    "Tiếng Anh",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "Tin học",
    "Giáo dục Kinh tế & Pháp luật",
    "Tiếng Trung",
    "Tiếng Nhật",
    "IELTS",
    "TOEIC",
    "SAT",
    "Cấu trúc dữ liệu và giải thuật",
    "Khác"
  ],

  "teachingLevels": [
    "Mầm Non",
    "Tiểu Học",
    "THCS",
    "THPT",
    "Đại Học"
  ],

  "locations": [
    "Bình Thạnh",
    "Thủ Đức",
    "Quận 3",
    "Phú Nhuận",
    "Cầu Giấy, Hà Nội",
    "Đống Đa, Hà Nội",
    "Thanh Xuân, Hà Nội"
  ],

  "providerPayloads": {
    "google": {
      "fullName": "Nguyễn Minh Anh",
      "email": "minhanh.demo@gmail.com",
      "phone": "",
      "emailVerified": true
    },
    "facebook": {
      "fullName": "Minh Anh Nguyễn",
      "email": "",
      "phone": "",
      "emailVerified": false
    }
  },

  "legacyRequestProposals": {
    "ref-1": {
      "days": [0, 2, 4],
      "start": 1140,
      "end": 1230
    },
    "ref-2": {
      "days": [1, 3],
      "start": 1095,
      "end": 1185
    },
    "ref-3": {
      "days": [5, 6],
      "start": 870,
      "end": 960
    },
    "req-1": {
      "days": [1, 3],
      "start": 1095,
      "end": 1185
    },
    "req-2": {
      "days": [5],
      "start": 780,
      "end": 870
    },
    "req-3": {
      "days": [0, 2],
      "start": 1140,
      "end": 1230
    }
  },

  "legacyTutorProfileDefaults": {
    "name": "Mai Anh Nguyễn",
    "subjects": "Toán, Vật lý",
    "area": "Bình Thạnh",
    "fee": "180000",
    "sessionMinutes": 45,
    "bio": "Giúp học sinh củng cố nền tảng bằng lộ trình rõ ràng và bài tập phù hợp."
  },

  "reviews": [
    {
      "id": "review-1",
      "tutorId": "mai-anh",
      "tutorName": "Nguyễn Mai Anh",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reviewerType": "learner",
      "name": "Nguyễn Minh Anh",
      "initials": "MA",
      "rating": 5,
      "text": "Cô Mai Anh giảng bài rất chi tiết và kiên nhẫn. Sau 2 tháng học thì điểm thi thử của em đã tăng rõ rệt.",
      "excerpt": "Cô Mai Anh giảng bài rất chi tiết và kiên nhẫn. Sau 2 tháng học thì điểm thi thử của em đã tăng rõ rệt.",
      "comment": "Cô Mai Anh giảng bài rất chi tiết và kiên nhẫn. Sau 2 tháng học thì điểm thi thử của em đã tăng rõ rệt.",
      "date": "28/09/2026",
      "createdAt": "2026-09-28T14:00:00+07:00",
      "visibility": "public",
      "moderationStatus": "approved",
      "status": "approved",
      "lessonId": "history-lesson-2026-09-27-01",
      "lessonSnapshot": {
        "subject": "Toán",
        "level": "THCS",
        "learnerName": "Nguyễn Minh Anh",
        "date": "2026-09-27",
        "start": 1020,
        "end": 1110,
        "durationMinutes": 90,
        "format": "Online",
        "area": "Bình Thạnh",
        "sessionFee": 180000
      }
    },
    {
      "id": "review-2",
      "tutorId": "quoc-bao",
      "tutorName": "Trần Gia Bảo",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reviewerType": "learner",
      "name": "Nguyễn Minh Anh",
      "initials": "MA",
      "rating": 5,
      "text": "Thầy dạy nhiệt tình, phương pháp luyện đề bám sát đề thi thật. Kỹ năng Speaking cải thiện nhiều.",
      "excerpt": "Thầy dạy nhiệt tình, phương pháp luyện đề bám sát đề thi thật. Kỹ năng Speaking cải thiện nhiều.",
      "comment": "Thầy dạy nhiệt tình, phương pháp luyện đề bám sát đề thi thật. Kỹ năng Speaking cải thiện nhiều.",
      "date": "25/09/2026",
      "createdAt": "2026-09-25T16:30:00+07:00",
      "visibility": "public",
      "moderationStatus": "approved",
      "status": "approved",
      "lessonId": null,
      "lessonSnapshot": {
        "subject": "Tiếng Anh",
        "level": "IELTS",
        "learnerName": "Nguyễn Minh Anh",
        "date": "2026-09-25",
        "start": 1080,
        "end": 1170,
        "durationMinutes": 90,
        "format": "Tại nhà",
        "area": "Thủ Đức",
        "sessionFee": 220000
      }
    },
    {
      "id": "review-3",
      "tutorId": "ha-linh",
      "tutorName": "Phạm Hà Linh",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reviewerType": "learner",
      "name": "Nguyễn Minh Anh",
      "initials": "MA",
      "rating": 5,
      "text": "Cô dạy Ngữ văn rất truyền cảm hứng, em không còn cảm thấy sợ môn này nữa.",
      "excerpt": "Cô dạy Ngữ văn rất truyền cảm hứng, em không còn cảm thấy sợ môn này nữa.",
      "comment": "Cô dạy Ngữ văn rất truyền cảm hứng, em không còn cảm thấy sợ môn này nữa.",
      "date": "20/09/2026",
      "createdAt": "2026-09-20T10:15:00+07:00",
      "visibility": "public",
      "moderationStatus": "approved",
      "status": "approved",
      "lessonId": null,
      "lessonSnapshot": {
        "subject": "Ngữ văn",
        "level": "THPT",
        "learnerName": "Nguyễn Minh Anh",
        "date": "2026-09-20",
        "start": 780,
        "end": 870,
        "durationMinutes": 90,
        "format": "Online",
        "area": "Quận 3",
        "sessionFee": 160000
      }
    },
    {
      "id": "review-4",
      "tutorId": "mai-anh",
      "tutorName": "Nguyễn Mai Anh",
      "learnerId": "user-learner-active-2",
      "learnerName": "Lê Hoàng Nam",
      "reviewerType": "parent",
      "name": "Lê Hoàng Nam",
      "initials": "HN",
      "rating": 5,
      "text": "Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi học Toán.",
      "excerpt": "Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi học Toán.",
      "comment": "Cách giảng dễ hiểu, bé tự tin hơn sau vài buổi học Toán.",
      "date": "02/10/2026",
      "createdAt": "2026-10-02T19:40:00+07:00",
      "visibility": "hidden",
      "moderationStatus": "pending",
      "status": "pending",
      "lessonId": null,
      "lessonSnapshot": {
        "subject": "Toán",
        "level": "THCS",
        "learnerName": "Lê Hoàng Nam",
        "date": "2026-10-02",
        "start": 1020,
        "end": 1110,
        "durationMinutes": 90,
        "format": "Tại nhà",
        "area": "Bình Thạnh",
        "sessionFee": 180000
      }
    },
    {
      "id": "review-5",
      "tutorId": "duc-minh",
      "tutorName": "Lê Đức Minh",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reviewerType": "learner",
      "name": "Nguyễn Minh Anh",
      "initials": "MA",
      "rating": 4,
      "text": "Gia sư đúng giờ và chuẩn bị bài kỹ, tuy nhiên phần bài tập hơi dài.",
      "excerpt": "Gia sư đúng giờ và chuẩn bị bài kỹ, tuy nhiên phần bài tập hơi dài.",
      "comment": "Gia sư đúng giờ và chuẩn bị bài kỹ, tuy nhiên phần bài tập hơi dài.",
      "date": "03/10/2026",
      "createdAt": "2026-10-03T20:10:00+07:00",
      "visibility": "hidden",
      "moderationStatus": "pending",
      "status": "pending",
      "lessonId": null,
      "lessonSnapshot": {
        "subject": "Hóa học",
        "level": "THPT",
        "learnerName": "Nguyễn Minh Anh",
        "date": "2026-10-03",
        "start": 1020,
        "end": 1110,
        "durationMinutes": 90,
        "format": "Online",
        "area": "Phú Nhuận",
        "sessionFee": 170000
      }
    },
    {
      "id": "review-6",
      "tutorId": "quoc-bao",
      "tutorName": "Trần Gia Bảo",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reviewerType": "learner",
      "name": "Nguyễn Minh Anh",
      "initials": "MA",
      "rating": 1,
      "text": "Đánh giá chứa nội dung quảng cáo dịch vụ bên ngoài và từ ngữ vi phạm quy định cộng đồng.",
      "excerpt": "Đánh giá chứa nội dung quảng cáo dịch vụ bên ngoài và từ ngữ vi phạm quy định cộng đồng.",
      "comment": "Đánh giá chứa nội dung quảng cáo dịch vụ bên ngoài và từ ngữ vi phạm quy định cộng đồng.",
      "date": "21/09/2026",
      "createdAt": "2026-09-21T10:30:00+07:00",
      "visibility": "hidden",
      "moderationStatus": "hidden",
      "status": "hidden",
      "hiddenReason": "Nội dung vi phạm quy tắc cộng đồng: phát tán liên kết thương mại bên ngoài.",
      "hiddenAt": "2026-09-21T10:30:00+07:00",
      "lessonId": null,
      "lessonSnapshot": {
        "subject": "Tiếng Anh",
        "level": "IELTS",
        "learnerName": "Nguyễn Minh Anh",
        "date": "2026-09-21",
        "start": 1080,
        "end": 1170,
        "durationMinutes": 90,
        "format": "Tại nhà",
        "area": "Thủ Đức",
        "sessionFee": 220000
      }
    }
  ],

  "issues": [
    {
      "id": "ISSUE-101",
      "code": "IS-2048",
      "title": "Vắng mặt buổi học không báo trước",
      "label": "Vắng mặt không báo trước",
      "category": "absence",
      "categoryLabel": "Vắng mặt không báo trước",
      "priority": "high",
      "status": "new",
      "statusLabel": "Mới tiếp nhận",
      "relatedUserId": "demo-learner",
      "relatedUserName": "Nguyễn Minh Anh",
      "related": "Nguyễn Minh Anh",
      "relatedTutorId": "quang-huy",
      "relatedTutorName": "Hoàng Quang Huy",
      "tutorId": "quang-huy",
      "tutorName": "Hoàng Quang Huy",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reportedBy": {
        "id": "demo-learner",
        "name": "Nguyễn Minh Anh",
        "username": "minhanh",
        "email": "learner@demo.tutornearme.vn",
        "role": "learner",
        "phone": "0900000001"
      },
      "targetUser": {
        "id": "user-tutor-suspended",
        "name": "Hoàng Quang Huy",
        "username": "quanghuy",
        "email": "quanghuy.tutor@demo.tutornearme.vn",
        "role": "tutor",
        "phone": "0900000013"
      },
      "description": "Học viên đã vào phòng học online đúng giờ hẹn 19:00 ngày 03/10 nhưng gia sư không xuất hiện và không liên lạc được qua điện thoại.",
      "received": "32 phút trước",
      "createdAt": "2026-10-04T18:15:00+07:00",
      "updatedAt": "2026-10-04T18:15:00+07:00",
      "resolutionNote": ""
    },
    {
      "id": "ISSUE-102",
      "code": "IS-2045",
      "title": "Tranh chấp thời lượng buổi học",
      "label": "Tranh chấp thời lượng buổi học",
      "category": "lesson_dispute",
      "categoryLabel": "Tranh chấp giờ học",
      "priority": "medium",
      "status": "in_progress",
      "statusLabel": "Đang xử lý",
      "relatedUserId": "user-learner-active-2",
      "relatedUserName": "Lê Hoàng Nam",
      "related": "Lê Hoàng Nam",
      "relatedTutorId": "quoc-bao",
      "relatedTutorName": "Trần Gia Bảo",
      "tutorId": "quoc-bao",
      "tutorName": "Trần Gia Bảo",
      "learnerId": "user-learner-active-2",
      "learnerName": "Lê Hoàng Nam",
      "reportedBy": {
        "id": "user-learner-active-2",
        "name": "Lê Hoàng Nam",
        "username": "hoangnam",
        "email": "nam.le@demo.tutornearme.vn",
        "role": "parent",
        "phone": "0900000010"
      },
      "targetUser": {
        "id": "demo-tutor",
        "name": "Trần Gia Bảo",
        "username": "giabao",
        "email": "tutor@demo.tutornearme.vn",
        "role": "tutor",
        "phone": "0900000002"
      },
      "description": "Phụ huynh phản ánh buổi học đăng ký 90 phút nhưng gia sư kết thúc sớm sau 45 phút mà vẫn tính nguyên mức học phí.",
      "received": "2 giờ trước",
      "createdAt": "2026-10-04T16:00:00+07:00",
      "updatedAt": "2026-10-04T17:00:00+07:00",
      "resolutionNote": "Đang liên hệ gia sư để đối soát thời lượng và xem xét hoàn lại 50% học phí buổi học."
    },
    {
      "id": "ISSUE-103",
      "code": "IS-2041",
      "title": "Hủy buổi học sát giờ hẹn",
      "label": "Hủy buổi học sát giờ hẹn",
      "category": "cancellation",
      "categoryLabel": "Hủy buổi đột xuất",
      "priority": "high",
      "status": "in_progress",
      "statusLabel": "Đang xử lý",
      "relatedUserId": "demo-learner",
      "relatedUserName": "Nguyễn Minh Anh",
      "related": "Nguyễn Minh Anh",
      "relatedTutorId": "quang-huy",
      "relatedTutorName": "Hoàng Quang Huy",
      "tutorId": "quang-huy",
      "tutorName": "Hoàng Quang Huy",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reportedBy": {
        "id": "demo-learner",
        "name": "Nguyễn Minh Anh",
        "username": "minhanh",
        "email": "learner@demo.tutornearme.vn",
        "role": "learner",
        "phone": "0900000001"
      },
      "targetUser": {
        "id": "user-tutor-suspended",
        "name": "Hoàng Quang Huy",
        "username": "quanghuy",
        "email": "quanghuy.tutor@demo.tutornearme.vn",
        "role": "tutor",
        "phone": "0900000013"
      },
      "description": "Gia sư nhắn tin hủy buổi học chỉ 15 phút trước giờ bắt đầu, gây gián đoạn kế hoạch ôn tập chuẩn bị thi giữa kỳ của học sinh.",
      "received": "Hôm qua",
      "createdAt": "2026-10-03T18:00:00+07:00",
      "updatedAt": "2026-10-03T19:30:00+07:00",
      "resolutionNote": "Đã tạm đình chỉ quyền nhận lớp của gia sư để chờ giải trình."
    },
    {
      "id": "ISSUE-104",
      "code": "IS-2039",
      "title": "Yêu cầu phụ thu học phí ngoài thỏa thuận",
      "label": "Yêu cầu phụ thu học phí ngoài thỏa thuận",
      "category": "fee_dispute",
      "categoryLabel": "Tranh chấp học phí",
      "priority": "medium",
      "status": "new",
      "statusLabel": "Mới tiếp nhận",
      "relatedUserId": "user-learner-active-2",
      "relatedUserName": "Phụ huynh bé Nam",
      "related": "Phụ huynh bé Nam",
      "relatedTutorId": "quoc-bao",
      "relatedTutorName": "Trần Gia Bảo",
      "tutorId": "quoc-bao",
      "tutorName": "Trần Gia Bảo",
      "learnerId": "user-learner-active-2",
      "learnerName": "Phụ huynh bé Nam",
      "reportedBy": {
        "id": "user-learner-active-2",
        "name": "Phụ huynh bé Nam",
        "username": "hoangnam",
        "email": "nam.le@demo.tutornearme.vn",
        "role": "parent",
        "phone": "0900000010"
      },
      "targetUser": {
        "id": "demo-tutor",
        "name": "Trần Gia Bảo",
        "username": "giabao",
        "email": "tutor@demo.tutornearme.vn",
        "role": "tutor",
        "phone": "0900000002"
      },
      "requestId": "req-3",
      "description": "Gia sư yêu cầu phụ huynh đóng thêm 200.000đ tiền in ấn giáo trình và đề cương ôn tập, trong khi hợp đồng ban đầu ghi học phí trọn gói.",
      "received": "2 ngày trước",
      "createdAt": "2026-10-02T11:20:00+07:00",
      "updatedAt": "2026-10-02T11:20:00+07:00",
      "resolutionNote": ""
    },
    {
      "id": "ISSUE-105",
      "code": "RP-1172",
      "title": "Phản ánh thái độ thiếu kiên nhẫn khi giảng bài",
      "label": "Phản ánh thái độ thiếu kiên nhẫn khi giảng bài",
      "category": "attitude",
      "categoryLabel": "Phản ánh thái độ",
      "priority": "low",
      "status": "resolved",
      "statusLabel": "Đã giải quyết",
      "resolutionAction": "warning_issued",
      "warnedUserId": "demo-tutor",
      "relatedUserId": "demo-learner",
      "relatedUserName": "Nguyễn Minh Anh",
      "related": "Nguyễn Minh Anh",
      "relatedTutorId": "quoc-bao",
      "relatedTutorName": "Trần Gia Bảo",
      "tutorId": "quoc-bao",
      "tutorName": "Trần Gia Bảo",
      "learnerId": "demo-learner",
      "learnerName": "Nguyễn Minh Anh",
      "reportedBy": {
        "id": "demo-learner",
        "name": "Nguyễn Minh Anh",
        "username": "minhanh",
        "email": "learner@demo.tutornearme.vn",
        "role": "learner",
        "phone": "0900000001"
      },
      "targetUser": {
        "id": "demo-tutor",
        "name": "Trần Gia Bảo",
        "username": "giabao",
        "email": "tutor@demo.tutornearme.vn",
        "role": "tutor",
        "phone": "0900000002"
      },
      "lessonId": "history-lesson-2026-09-27-01",
      "description": "Học viên cảm thấy gia sư có biểu hiện cáu gắt và không giải thích kỹ khi học viên chưa hiểu bài trong buổi học IELTS ngày 27/09.",
      "received": "29/09/2026",
      "createdAt": "2026-09-28T09:00:00+07:00",
      "updatedAt": "2026-10-04T15:30:00+07:00",
      "resolutionNote": "Quản trị viên đã trao đổi trực tiếp với gia sư. Gia sư đã gửi lời xin lỗi học viên và cam kết điều chỉnh phương pháp sư phạm.",
      "resolvedAt": "2026-09-29T15:30:00+07:00",
      "resolvedBy": "Quản trị viên"
    }
  ]
};

baseReferenceData.users = baseReferenceData.accounts;
export const demoReferenceData = freeze(baseReferenceData);