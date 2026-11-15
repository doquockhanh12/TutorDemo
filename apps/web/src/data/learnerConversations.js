export function sanitizeConversations(list) {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set();
  const seenNames = new Set();
  const result = [];
  for (const item of list) {
    if (!item) continue;
    const nameKey = (item.name || '').trim().toLowerCase();
    const idKey = item.id || item.tutorId;
    if ((idKey && seenIds.has(idKey)) || (nameKey && seenNames.has(nameKey))) {
      continue; // Bỏ qua bản ghi trùng lặp
    }
    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);
    result.push(item);
  }
  return result;
}

export const initialLearnerConversations = [
  {
    id: 'quoc-bao',
    tutorId: 'quoc-bao',
    name: 'Trần Gia Bảo',
    subject: 'Tiếng Anh',
    avatar: 'GB',
    color: 'blue',
    unread: 1,
    messages: [
      {
        id: 'msg-1',
        from: 'me',
        text: 'Em chào thầy ạ!',
        time: '09:20',
      },
      {
        id: 'msg-2',
        from: 'me',
        text: 'Thầy cho em hỏi buổi học tiếp theo mình ôn phần nào ạ?',
        time: '09:22',
      },
      {
        id: 'msg-3',
        from: 'them',
        text: 'Chào em! Buổi tới chúng ta sẽ ôn ngữ pháp và luyện đọc nhé.',
        time: '09:25',
      },
      {
        id: 'msg-4',
        from: 'me',
        text: 'Dạ vâng ạ, em sẽ chuẩn bị bài trước.',
        time: '09:28',
      },
      {
        id: 'msg-5',
        from: 'them',
        text: 'Em nhớ xem trước 150 từ vựng Unit 3 trong mục Bài học của lớp nhé!',
        time: '09:35',
      },
    ],
  },
  {
    id: 'mai-anh',
    tutorId: 'mai-anh',
    name: 'Nguyễn Mai Anh',
    subject: 'IELTS',
    avatar: 'MA',
    color: 'purple',
    unread: 1,
    messages: [
      {
        id: 'msg-ma-1',
        from: 'them',
        text: 'Chào Minh Anh, cô đã nhận được yêu cầu học IELTS của em rồi nhé.',
        time: '10:10',
      },
      {
        id: 'msg-ma-2',
        from: 'them',
        text: 'Em có thể gửi trước bài viết gần nhất để cô xem trình độ hiện tại không?',
        time: '10:12',
      },
    ],
  },
  {
    id: 'duc-minh',
    tutorId: 'duc-minh',
    name: 'Lê Đức Minh',
    subject: 'Toán',
    avatar: 'ĐM',
    color: 'green',
    unread: 0,
    messages: [
      {
        id: 'msg-ln-1',
        from: 'me',
        text: 'Thầy ơi bài tập phương trình em nộp trong lớp học rồi ạ.',
        time: 'Hôm qua',
      },
      {
        id: 'msg-ln-2',
        from: 'them',
        text: 'Thầy đã chấm và gửi phản hồi 9.5 điểm rồi đó, em kiểm tra nhé.',
        time: 'Hôm qua',
      },
    ],
  },
];
