import { safeEvidenceLink } from '../domain/appeals.js';

export default function AppealEvidence({ evidence }) {
  return <div className="appeal-evidence-list">{evidence.map((item, index) => <article key={index}>
    <strong>{item.name || `Bằng chứng ${index + 1}`}</strong><p>{item.description}</p>
    {item.kind === 'link' && safeEvidenceLink(item.url) && <a href={safeEvidenceLink(item.url)} target="_blank" rel="noopener noreferrer">Mở bằng chứng</a>}
    {item.kind === 'file' && item.type?.startsWith('image/') && item.data?.startsWith(`data:${item.type};base64,`) && <img src={item.data} alt={item.description} />}
    {item.kind === 'file' && item.type === 'application/pdf' && item.data?.startsWith('data:application/pdf;base64,') && <a href={item.data} download={item.name}>Tải bằng chứng PDF</a>}
  </article>)}</div>;
}
