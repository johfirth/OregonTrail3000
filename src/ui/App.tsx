import React from 'react';

export default function App(): React.ReactElement {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Courier New', Courier, monospace",
      backgroundColor: '#0a0a0a',
      color: '#00ff41',
    }}>
      <h1>🌙 LUNAR COLONY 3000 🚀</h1>
      <p>An Oregon Trail Adventure... IN SPACE</p>
      <p style={{ color: '#666', marginTop: '2rem' }}>
        Game engine loading...
      </p>
    </div>
  );
}
