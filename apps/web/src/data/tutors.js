export const tutors = [
  {
    id: 'mai-anh', name: 'Nguyễn Mai Anh', initials: 'MA', avatarTone: 'sage',
    subjects: ['Toán', 'Vật lý'], location: 'Bình Thạnh', availability: ['Buổi tối', 'Cuối tuần'],
    price: 180000, rating: 4.9, reviews: 48, experience: '3 năm kinh nghiệm',
    university: 'ĐH Khoa học Tự nhiên', featured: true, verified: true,
    intro: 'Giúp học sinh xây nền tảng vững chắc qua cách giải thích gần gũi và lộ trình học rõ ràng.',
  },
  {
    id: 'quoc-bao', name: 'Trần Quốc Bảo', initials: 'QB', avatarTone: 'clay',
    subjects: ['Tiếng Anh', 'IELTS'], location: 'Thủ Đức', availability: ['Buổi tối', 'Cuối tuần'],
    price: 220000, rating: 4.9, reviews: 36, experience: '4 năm kinh nghiệm',
    university: 'ĐH Ngoại thương', featured: false, verified: true,
    intro: 'Tập trung phản xạ giao tiếp và phương pháp tự học để học viên tiến bộ bền vững.',
  },
  {
    id: 'ha-linh', name: 'Phạm Hà Linh', initials: 'HL', avatarTone: 'moss',
    subjects: ['Ngữ văn', 'Tiếng Anh'], location: 'Quận 3', availability: ['Buổi chiều', 'Cuối tuần'],
    price: 160000, rating: 4.8, reviews: 29, experience: '2 năm kinh nghiệm',
    university: 'ĐH Sư phạm TP.HCM', featured: false, verified: true,
    intro: 'Biến bài học thành cuộc trò chuyện dễ hiểu, khuyến khích học viên đặt câu hỏi.',
  },
  {
    id: 'duc-minh', name: 'Lê Đức Minh', initials: 'ĐM', avatarTone: 'sand',
    subjects: ['Toán', 'Hóa học'], location: 'Phú Nhuận', availability: ['Buổi chiều', 'Buổi tối'],
    price: 170000, rating: 4.8, reviews: 31, experience: '3 năm kinh nghiệm',
    university: 'ĐH Bách khoa TP.HCM', featured: false, verified: true,
    intro: 'Hướng dẫn từng bước và luyện tập theo mức độ, phù hợp học sinh cần củng cố kiến thức.',
  },
  {
    id: 'thu-trang', name: 'Võ Thu Trang', initials: 'TT', avatarTone: 'rose',
    subjects: ['Tiếng Anh', 'Ngữ văn'], location: 'Bình Thạnh', availability: ['Buổi sáng', 'Cuối tuần'],
    price: 190000, rating: 4.7, reviews: 22, experience: '2 năm kinh nghiệm',
    university: 'ĐH Sư phạm TP.HCM', featured: false, verified: true,
    intro: 'Lớp học cởi mở, chú trọng thực hành và ghi nhận tiến bộ qua từng buổi.',
  },
  {
    id: 'gia-huy', name: 'Đặng Gia Huy', initials: 'GH', avatarTone: 'slate',
    subjects: ['Vật lý', 'Toán'], location: 'Thủ Đức', availability: ['Buổi tối'],
    price: 150000, rating: 4.7, reviews: 18, experience: '2 năm kinh nghiệm',
    university: 'ĐH Khoa học Tự nhiên', featured: false, verified: false,
    intro: 'Liên hệ kiến thức với tình huống thực tế để các công thức trở nên dễ nhớ hơn.',
  },
];

export const subjectOptions = ['Tất cả môn', 'Toán', 'Tiếng Anh', 'Ngữ văn', 'Vật lý', 'Hóa học', 'IELTS'];
export const locationOptions = ['Tất cả khu vực', 'Bình Thạnh', 'Thủ Đức', 'Quận 3', 'Phú Nhuận'];
export const availabilityOptions = ['Mọi khung giờ', 'Buổi sáng', 'Buổi chiều', 'Buổi tối', 'Cuối tuần'];
