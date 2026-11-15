import { EVIDENCE_FILE_LIMIT, EVIDENCE_TOTAL_LIMIT } from '../../features/domain/appeals.js';
export const reportImagesInvalid = (files) => files.length > 3 || files.some((file) => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > EVIDENCE_FILE_LIMIT) || files.reduce((sum, file) => sum + file.size, 0) > EVIDENCE_TOTAL_LIMIT;
export async function readReportImages(files) { return await Promise.all(files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = reject;
        reader.onload = () => resolve({ kind: 'file', name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      }))); }
