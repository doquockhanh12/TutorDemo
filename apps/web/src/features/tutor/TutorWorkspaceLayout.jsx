import { useState } from 'react';
import TutorHeader from './TutorHeader.jsx';
import TutorSidebar from './TutorSidebar.jsx';
import useTutorWorkspace from './TutorWorkspaceState.jsx';

export default function TutorWorkspaceLayout({ children, className = '' }) {
  const [open, setOpen] = useState(false);
  const { requests } = useTutorWorkspace();
  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  return <div className={`workspace tutor-workspace density-standard ${className}`}>
    <TutorSidebar open={open} onClose={() => setOpen(false)} pendingCount={pendingCount}/>
    {open && <button type="button" className="workspace-scrim" aria-label="Đóng điều hướng" onClick={() => setOpen(false)}/>}
    <div className="workspace__main"><TutorHeader onOpen={() => setOpen(true)}/>{children}</div>
  </div>;
}
