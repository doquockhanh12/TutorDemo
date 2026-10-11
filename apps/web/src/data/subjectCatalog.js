export const subjectCategories = [
  { id: 'school', name: 'Môn học phổ thông' }, { id: 'language', name: 'Ngoại ngữ' },
  { id: 'certificate', name: 'Chứng chỉ ngoại ngữ' }, { id: 'music', name: 'Âm nhạc' },
  { id: 'art', name: 'Nghệ thuật' }, { id: 'technology', name: 'Công nghệ' },
  { id: 'skills', name: 'Kỹ năng' },
];

const entries = {
  school: ['Toán', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Sinh học'],
  language: ['Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn'],
  certificate: ['IELTS', 'TOEIC', 'TOEFL', 'HSK'],
  music: ['Piano', 'Guitar', 'Violin', 'Thanh nhạc', 'Ukulele'],
  art: ['Vẽ', 'Vẽ chì', 'Vẽ màu nước', 'Vẽ Digital', 'Nhiếp ảnh'],
  technology: ['Lập trình', 'Thiết kế Web', 'UI/UX', 'Tin học', 'Tin học văn phòng'],
  skills: ['Giao tiếp', 'Thuyết trình', 'Kỹ năng mềm'],
};
const aliases = {
  'Vẽ': ['Mỹ thuật', 'Mĩ thuật', 'Drawing', 'Art', 'Hội họa'],
  'Vật lý': ['Lý'], 'Hóa học': ['Hóa'], 'Ngữ văn': ['Văn'],
  'Tiếng Anh': ['Anh văn', 'English'], 'Tin học văn phòng': ['Excel', 'Word'],
};
export const subjects = Object.entries(entries).flatMap(([categoryId, names]) => names.map((name) => ({
  id: `${categoryId}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')}`,
  name, categoryId, aliases: aliases[name] || [],
})));

export const normalizeSubjectSearch = (value) => value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
export const findSubjects = (query) => {
  const term = normalizeSubjectSearch(query);
  return subjects.filter((subject) => !term || [subject.name, ...subject.aliases].some((label) => normalizeSubjectSearch(label).includes(term)));
};
export const subjectById = (id) => subjects.find((subject) => subject.id === id);
export const subjectIdsFromNames = (names) => names.map((name) => subjects.find((subject) => normalizeSubjectSearch(subject.name) === normalizeSubjectSearch(name))?.id).filter(Boolean);
export const studentLevels = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Sinh viên', 'Người đi làm', 'Người lớn', 'Mọi độ tuổi'];
