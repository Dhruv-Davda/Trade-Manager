import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🧪 TEST MODE - App Loading</h1>
        <p>If you can see this, React is working!</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          border: '1px solid #333', 
          borderRadius: '8px',
          backgroundColor: '#2a2a2a'
        }}>
          <p>✅ React App is loading successfully</p>
          <p>✅ No infinite loading issue</p>
          <p>✅ Basic rendering works</p>
        </div>
      </div>
    </div>
  );
}

export default App;
