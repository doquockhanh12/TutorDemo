import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-700.css';
import '@fontsource/source-sans-3/vietnamese-400.css';
import '@fontsource/source-sans-3/vietnamese-600.css';
import '@fontsource/source-sans-3/vietnamese-700.css';
import '@fontsource/literata/latin-500.css';
import '@fontsource/literata/latin-600.css';
import '@fontsource/literata/vietnamese-500.css';
import '@fontsource/literata/vietnamese-600.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/global.css';
import './styles/utilities.css';
import './components/components.css';
import './features/learner/learner.css';
import './features/tutor/tutor.css';
import './features/admin/admin.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
