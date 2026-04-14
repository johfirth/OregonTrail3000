import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './hooks/useSettings';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </React.StrictMode>
  );
}
