import { classMaterialsBySubject, fallbackClassRequest, initialClassSubmissions } from '../../data/learner/classes.js';

export function selectLearnerClasses(requests, tutors, allLessons, user) {
    const accepted = [...requests.filter((r) => r.status === 'accepted')];

    if (user?.id === 'demo-learner' && !accepted.some((r) => !r.completed)) {
      accepted.unshift({ ...fallbackClassRequest });
    }

    const classes = accepted.map((req) => {
      const tutor = tutors.find((t) => t.id === req.tutorId) || tutors[0];
      const classLessons = allLessons.filter(
        (l) => (l.requestId === req.id || (l.tutorId === req.tutorId && l.learnerId === user?.id))
          && l.status !== 'cancelled'
      );
      const isCompleted = Boolean(req.completed);
      const doneCount = isCompleted
        ? Math.max(classLessons.filter((l) => l.status === 'completed').length, 4)
        : 2;
      const totalCount = isCompleted ? doneCount : 6;
      const progress = Math.min(100, Math.round((doneCount / totalCount) * 100));
      const materials = classMaterialsBySubject[req.subject] || classMaterialsBySubject['Tiếng Anh'];

      return {
        id: req.id,
        subject: req.subject,
        goal: req.goal || 'Bám sát lộ trình cá nhân hóa',
        schedule: req.schedule || 'Thứ 7 · 09:00',
        format: req.format || 'Online / Tại nhà',
        sessionFee: req.sessionFee || tutor?.price || 180000,
        completed: isCompleted,
        tutor,
        doneCount,
        totalCount,
        progress,
        materials,
        lessons: classLessons,
      };
    });

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    return { classes, pendingCount, user };
}

export function selectClassList(classes, filter) {
  const ongoingCount = classes.filter((c) => !c.completed).length;
  const completedCount = classes.filter((c) => c.completed).length;
  const visibleClasses = filter === 'ongoing' ? classes.filter((c) => !c.completed) : filter === 'completed' ? classes.filter((c) => c.completed) : classes;
  return { ongoingCount, completedCount, visibleClasses };
}
export function createInitialClassSubmissions() { return initialClassSubmissions.map((item) => ({ ...item })); }
export function createClassSubmission(fileName, uploadNote) { return {
        id: `sub-${Date.now()}`,
        title: fileName,
        submittedAt: 'Vừa nộp xong',
        status: 'Chờ gia sư nhận xét',
        score: 'Đang chấm',
        feedback: uploadNote.trim()
          ? `Lời nhắn của bạn: “${uploadNote.trim()}” — Gia sư sẽ xem và phản hồi trước buổi học tiếp theo.`
          : 'Đang chờ gia sư xem bài và gửi nhận xét chi tiết.',
      }; }
