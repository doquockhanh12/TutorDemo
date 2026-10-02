import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { DemoAuthProvider } from './features/auth/DemoAuthContext.jsx';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/vietnamese-400.css';
import '@fontsource/nunito/vietnamese-700.css';
import '@fontsource/nunito/vietnamese-800.css';
import '@fontsource/nunito-sans/latin-400.css';
import '@fontsource/nunito-sans/latin-600.css';
import '@fontsource/nunito-sans/latin-700.css';
import '@fontsource/nunito-sans/vietnamese-400.css';
import '@fontsource/nunito-sans/vietnamese-600.css';
import '@fontsource/nunito-sans/vietnamese-700.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/global.css';
import './components/components.css';
import './features/learner/learner.css';
import './features/tutor/tutor.css';
import './features/admin/admin.css';
import './features/public/public.css';
import './features/auth/auth.css';
import './styles/flows.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoAuthProvider><App /></DemoAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
