import useDemoDomain from '../../domain/DemoDomainContext.jsx';
import { reportImagesInvalid, readReportImages } from '../../../services/learner/reportEvidenceService.js';
export default function useLearnerReportData() {
 const { createTutorReport } = useDemoDomain();
 return { createTutorReport, reportImagesInvalid, readReportImages };
}
