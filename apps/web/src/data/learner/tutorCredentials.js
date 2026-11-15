export function createFallbackTutorCredentials(tutor) { return [
    {
      id: 'default-doc-1',
      title: `Thẻ sinh viên ${tutor.university || 'Đại học xác minh'}`,
      issuedBy: tutor.university || 'Trường Đại học tại TP.HCM',
      fileType: 'JPG',
      status: 'verified',
    },
    {
      id: 'default-doc-2',
      title: 'Căn cước công dân / Hồ sơ định danh',
      issuedBy: 'Hệ thống kiểm duyệt TutorNearMe',
      fileType: 'PDF',
      status: 'verified',
    },
  ]; }
