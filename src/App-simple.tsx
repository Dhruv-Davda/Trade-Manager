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
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          🚀 Trade Manager
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#ccc' }}>
          Your trade management application is loading...
        </p>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #333', 
          borderRadius: '8px',
          backgroundColor: '#2a2a2a',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>✅ Status Check</h3>
          <p>✅ React is working</p>
          <p>✅ Build is successful</p>
          <p>✅ Deployment is active</p>
        </div>
        <div style={{ 
          padding: '15px', 
          border: '1px solid #f59e0b', 
          borderRadius: '8px',
          backgroundColor: '#451a03',
          color: '#fbbf24'
        }}>
          <p><strong>If you can see this page, the basic setup is working!</strong></p>
          <p>The authentication system will be restored once we confirm this loads.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
