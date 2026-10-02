import { tutors } from './tutors.js';

export const photo = {
  homeHero: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=84',
  learnerHero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=84',
  learnerSide: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=84',
  tutorHero: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=86',
  tutorSide: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=84',
  maths: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=700&q=82',
  exam: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=700&q=82',
  english: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=700&q=82',
  community: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=82',
  story: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=84',
};

export const publicTutors = tutors.map((tutor) => ({
  id: tutor.id,
  name: tutor.name,
  subject: tutor.subjects[0],
  area: tutor.location,
  time: tutor.availability[0],
  fee: tutor.price,
  rating: tutor.rating,
  reviews: tutor.reviews,
  university: tutor.university,
  initials: tutor.initials,
  tone: tutor.avatarTone,
  image: tutor.image,
  bio: tutor.intro,
  verified: tutor.verified,
}));

export const publicRequests = [
  { id: 'r1', title: 'Củng cố Toán lớp 9 trước kỳ kiểm tra', subject: 'Toán', area: 'Bình Thạnh', time: 'Buổi tối', fee: 220000, fit: 96, age: '2 giờ trước' },
  { id: 'r2', title: 'Luyện giao tiếp và phản xạ tiếng Anh', subject: 'Tiếng Anh', area: 'Thủ Đức', time: 'Cuối tuần', fee: 250000, fit: 92, age: '4 giờ trước' },
  { id: 'r3', title: 'Ôn Vật lý 10 theo chuyên đề', subject: 'Vật lý', area: 'Quận 3', time: 'Buổi chiều', fee: 190000, fit: 86, age: 'Hôm qua' },
  { id: 'r4', title: 'IELTS Writing từ 5.5 lên 6.5', subject: 'IELTS', area: 'Phú Nhuận', time: 'Buổi tối', fee: 280000, fit: 89, age: 'Hôm qua' },
];

export const money = (value) => new Intl.NumberFormat('vi-VN').format(value);
