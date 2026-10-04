export default function RequestSelectionDetails({ request }) {
  if (!request.subjects) return null;
  const onlineOnly = request.formats?.length ? request.formats.every((format) => format === 'Online') : request.format === 'Online';
  const areaLabel = request.areas?.length ? request.areas.join(', ') : onlineOnly ? 'Không yêu cầu khu vực — học online' : 'Chưa có khu vực được gửi';
  return <dl><div><dt>Các môn đã chọn</dt><dd>{request.subjects.join(', ')}</dd></div>{request.levels?.length > 0 && <div><dt>Cấp độ</dt><dd>{request.levels.join(', ')}</dd></div>}<div><dt>Khu vực mong muốn</dt><dd>{areaLabel}</dd></div></dl>;
}
