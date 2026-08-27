import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 1. Import useTheme

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme(); // 2. Call useTheme

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: theme.bg, // 3. Use theme background
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Optional floating theme toggle button in the top right corner */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 14px',
          backgroundColor: theme.cardBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500'
        }}
      >
        {isDarkMode ? ' Light' : ' Dark'}
      </button>

      <form onSubmit={handleSubmit} style={{ 
        background: theme.cardBg, // 4. Use theme card background
        padding: '40px 36px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', 
        width: '100%',
        maxWidth: '400px', 
        color: theme.text, // 5. Use theme text color
        boxSizing: 'border-box',
        border: `1px solid ${theme.border}` // 6. Use theme border
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: theme.text }}>Welcome</h2>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textMuted }}>Please sign in with your corporate credentials</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2', 
            border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
            color: isDarkMode ? '#fca5a5' : '#dc2626', 
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '20px', 
            fontSize: '13px', 
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span></span> {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: theme.text }}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
            placeholder="Enter your username"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              boxSizing: 'border-box', 
              borderRadius: '6px', 
              border: `1px solid ${theme.inputBorder}`, 
              backgroundColor: theme.inputBg, 
              color: theme.text,
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: theme.text }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder="••••••••"
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              boxSizing: 'border-box', 
              borderRadius: '6px', 
              border: `1px solid ${theme.inputBorder}`, 
              backgroundColor: theme.inputBg, 
              color: theme.text,
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '11px', 
            backgroundColor: loading ? '#93c5fd' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: '600', 
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}