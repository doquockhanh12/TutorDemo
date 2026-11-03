export const subjectCategories = [
  { id: 'school', name: 'Môn học phổ thông' }, { id: 'language', name: 'Ngoại ngữ' },
  { id: 'certificate', name: 'Chứng chỉ ngoại ngữ' }, { id: 'music', name: 'Âm nhạc' },
  { id: 'art', name: 'Nghệ thuật' }, { id: 'technology', name: 'Công nghệ thông tin' },
  { id: 'sports', name: 'Thể thao' }, { id: 'skills', name: 'Kỹ năng mềm' }, { id: 'other', name: 'Các lĩnh vực khác' },
];

const entries = {
  school: ['Toán', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Sinh học'],
  language: ['Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn'],
  certificate: ['IELTS', 'TOEIC', 'TOEFL', 'HSK'],
  music: ['Piano', 'Guitar', 'Violin', 'Thanh nhạc', 'Ukulele'],
  art: ['Vẽ', 'Vẽ chì', 'Vẽ màu nước', 'Vẽ Digital', 'Nhiếp ảnh'],
  technology: ['Lập trình', 'Thiết kế Web', 'UI/UX', 'Tin học', 'Tin học văn phòng'],
  skills: ['Giao tiếp', 'Thuyết trình', 'Kỹ năng mềm'], sports: ['Bơi lội', 'Bóng đá'], other: [],
};
const aliases = {
  'Vẽ': ['Drawing'],
  'Vật lý': ['Lý'], 'Hóa học': ['Hóa'], 'Ngữ văn': ['Văn'],
  'Tiếng Anh': ['Anh văn', 'English'], 'Tin học văn phòng': ['Excel', 'Word'],
  'Piano': ['Đàn Piano', 'Dương cầm'],
};
const legacySubjects = Object.entries(entries).flatMap(([categoryId, names]) => names.map((name) => ({
  id: `${categoryId}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')}`,
  name, categoryId, aliases: aliases[name] || [],
})));
// Parent subjects organize discovery. Selecting one never selects its children.
const hierarchy = [
  { id: 'technology-ai', name: 'Trí tuệ nhân tạo (AI)', categoryId: 'technology', aliases: ['AI', 'Artificial Intelligence', 'Trí tuệ nhân tạo'], children: ['Machine Learning', 'Deep Learning', 'Generative AI', 'Prompt Engineering', 'Ứng dụng công cụ AI'] },
  { id: 'art-drawing', name: 'Vẽ / Hội họa', categoryId: 'art', aliases: ['Hội họa', 'Drawing'], keywords: ['Mĩ thuật', 'Mỹ thuật', 'Art'], children: ['Vẽ cơ bản', 'Vẽ chì', 'Vẽ màu nước', 'Digital Painting', 'Luyện thi mỹ thuật'] },
  { id: 'language-tieng-anh', name: 'Tiếng Anh', categoryId: 'language', aliases: ['English', 'Anh văn'], children: ['Tiếng Anh giao tiếp', 'Tiếng Anh trẻ em', 'IELTS', 'TOEIC', 'TOEFL'] },
  { id: 'school-math', name: 'Toán học', categoryId: 'school', aliases: ['Toán'], children: ['Toán THCS', 'Toán THPT'] },
  { id: 'music-general', name: 'Âm nhạc', categoryId: 'music', aliases: [], children: ['Piano', 'Guitar', 'Violin', 'Thanh nhạc'] },
  { id: 'technology-programming', name: 'Lập trình', categoryId: 'technology', aliases: ['Programming'], children: ['Lập trình Python', 'Lập trình Web'] },
];
const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');
const newSubjects = hierarchy.flatMap((parent) => [
  ...(!legacySubjects.some((subject) => subject.id === parent.id) ? [{ id: parent.id, name: parent.name, categoryId: parent.categoryId, aliases: parent.aliases, keywords: parent.keywords || [], kind: 'parent' }] : []),
  ...parent.children.filter((name) => !legacySubjects.some((subject) => subject.name === name)).map((name) => ({ id: `${parent.id}-${slug(name)}`, name, categoryId: parent.categoryId, parentId: parent.id, aliases: [], keywords: [], kind: 'specialization' })),
]);
export const subjects = [...legacySubjects.map((subject) => {
  const parent = hierarchy.find((item) => item.children.includes(subject.name));
  return parent ? { ...subject, parentId: parent.id, kind: 'specialization' } : hierarchy.some((item) => item.id === subject.id) ? { ...subject, kind: 'parent' } : subject;
}), ...newSubjects];
export const subjectSpecializations = subjects.filter((subject) => subject.parentId);
export const popularTutorSubjectIds = ['school-toan', 'language-tieng-anh', 'certificate-ielts', 'technology-ai', 'technology-ai-machine-learning', 'art-drawing', 'music-piano'];
export const subjectAliases = subjects.flatMap((subject) => subject.aliases.map((alias) => ({ subjectId: subject.id, alias })));

export const normalizeSubjectSearch = (value) => value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
export const findSubjects = (query) => {
  const term = normalizeSubjectSearch(query);
  return subjects.filter((subject) => !term || [subject.name, ...subject.aliases, ...(subject.keywords || [])].some((label) => normalizeSubjectSearch(label).includes(term)));
};
export const subjectById = (id) => subjects.find((subject) => subject.id === id);
export const subjectIdsFromNames = (names) => names.map((name) => subjects.find((subject) => normalizeSubjectSearch(subject.name) === normalizeSubjectSearch(name))?.id).filter(Boolean);
export const studentLevels = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Sinh viên', 'Người đi làm', 'Người lớn', 'Mọi độ tuổi'];
