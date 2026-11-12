export const initialConversations = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    subject: 'Tiếng Anh',
    avatar: 'MA',
    color: 'blue',
    unread: 2,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Em chào thầy ạ!',
        time: '09:20',
      },
      {
        id: 2,
        from: 'them',
        text: 'Thầy cho em hỏi buổi học tiếp theo mình ôn phần nào ạ?',
        time: '09:22',
      },
      {
        id: 3,
        from: 'me',
        text: 'Chào em! Buổi tới chúng ta sẽ ôn ngữ pháp và luyện đọc nhé.',
        time: '09:25',
      },
      {
        id: 4,
        from: 'them',
        text: 'Dạ vâng ạ, em sẽ chuẩn bị bài trước.',
        time: '09:28',
      },
    ],
  },
  {
    id: 2,
    name: 'Trần Khánh Linh',
    subject: 'IELTS',
    avatar: 'KL',
    color: 'purple',
    unread: 1,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Thầy ơi, em đã làm xong bài Writing rồi ạ.',
        time: '10:10',
      },
      {
        id: 2,
        from: 'me',
        text: 'Tốt lắm! Em gửi bài ở đây để thầy xem nhé.',
        time: '10:15',
      },
      {
        id: 3,
        from: 'them',
        text: 'Dạ, em gửi thầy ngay ạ.',
        time: '10:18',
      },
    ],
  },
  {
    id: 3,
    name: 'Phạm Gia Huy',
    subject: 'Tiếng Anh',
    avatar: 'GH',
    color: 'orange',
    unread: 0,
    messages: [
      {
        id: 1,
        from: 'me',
        text: 'Em nhớ hoàn thành bài tập buổi trước nhé.',
        time: 'Hôm qua',
      },
      {
        id: 2,
        from: 'them',
        text: 'Dạ em làm gần xong rồi thầy.',
        time: 'Hôm qua',
      },
    ],
  },
  {
    id: 4,
    name: 'Lê Ngọc Mai',
    subject: 'IELTS',
    avatar: 'NM',
    color: 'green',
    unread: 0,
    messages: [
      {
        id: 1,
        from: 'them',
        text: 'Cảm ơn thầy về buổi học hôm qua ạ.',
        time: 'Thứ 2',
      },
    ],
  },
];
