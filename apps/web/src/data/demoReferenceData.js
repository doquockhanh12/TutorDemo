// Temporary immutable frontend seed. Values migrated from approved current fixtures.
// Runtime actions must clone this data into the domain provider.
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }

  return value;
}

export const demoReferenceData = freeze({
  "accounts": [
    {
      "id": "demo-learner",
      "fullName": "Nguyễn Minh Anh",
      "username": "minhanh",
      "email": "learner@demo.tutornearme.vn",
      "phone": "0900000001",
      "role": "learner",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      }
    },
    {
      "id": "demo-tutor",
      "fullName": "Trần Gia Bảo",
      "username": "giabao",
      "email": "tutor@demo.tutornearme.vn",
      "phone": "0900000002",
      "role": "tutor",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      }
    },
    {
      "id": "demo-admin",
      "fullName": "Quản trị viên",
      "username": "admin",
      "email": "admin@demo.tutornearme.vn",
      "phone": "0900000003",
      "role": "admin",
      "password": "demo1234",
      "linkedProviders": [],
      "verified": {
        "email": true,
        "phone": true
      }
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
  }
});