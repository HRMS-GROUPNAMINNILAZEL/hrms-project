import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { forgotPassword, resetPassword } from '../services/api';

// --- Theme-aware style helpers (mirrors the polished styling from the main branch) ---
const getStyles = (theme, isDarkMode) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: theme.bg,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative'
  },
  themeToggle: {
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
  },
  card: {
    background: theme.cardBg,
    padding: '40px 36px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '360px',
    color: theme.text,
    boxSizing: 'border-box',
    border: `1px solid ${theme.border}`
  },
  label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: theme.text },
  input: {
    width: '100%',
    padding: '10px 12px',
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: `1px solid ${theme.inputBorder}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
    fontSize: '14px',
    outline: 'none'
  },
  primaryBtn: {
    width: '100%',
    padding: '11px',
    backgroundColor: theme.primary,
    color: theme.primaryText,
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: theme.primary,
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
    marginTop: '14px',
    display: 'block',
    textAlign: 'center',
    width: '100%'
  },
  errorBox: {
    backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2',
    border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`,
    color: isDarkMode ? '#fca5a5' : '#dc2626',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '13px',
    textAlign: 'center'
  },
  successBox: {
    backgroundColor: isDarkMode ? '#052e16' : '#d4edda',
    border: `1px solid ${isDarkMode ? '#166534' : '#c3e6cb'}`,
    color: isDarkMode ? '#86efac' : '#155724',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '13px',
    textAlign: 'center'
  }
});

function ThemeToggleButton({ theme, toggleTheme, isDarkMode }) {
  return (
    <button onClick={toggleTheme} style={getStyles(theme, isDarkMode).themeToggle}>
      {isDarkMode ? '☀ Light' : '🌙 Dark'}
    </button>
  );
}

// --- Step 1: request a reset link/token ---
function ForgotPasswordForm({ onTokenIssued, onBack, theme, isDarkMode }) {
  const s = getStyles(theme, isDarkMode);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(usernameOrEmail);
      setMessage(res.message);
      // This project has no email service wired up, so the backend hands the
      // reset token straight back instead of mailing it. In a real deployment
      // this would arrive as a link in the user's inbox, not on-screen.
      if (res.resetToken) {
        onTokenIssued(res.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={s.card}>
      <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', color: theme.text, fontSize: '20px', fontWeight: '700' }}>Forgot Password</h2>
      <p style={{ fontSize: '13px', color: theme.textMuted, textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
        Enter your username or email and we'll generate a reset link.
      </p>

      {error && <div style={s.errorBox}>{error}</div>}
      {message && <div style={s.successBox}>{message}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label style={s.label}>Username or Email</label>
        <input type="text" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} required style={s.input} />
      </div>

      <button type="submit" disabled={loading} style={s.primaryBtn}>
        {loading ? 'Please wait...' : 'Send Reset Link'}
      </button>
      <button type="button" onClick={onBack} style={s.linkBtn}>Back to login</button>
    </form>
  );
}

// --- Step 2: use the token to set a new password ---
function ResetPasswordForm({ initialToken, onDone, onBack, theme, isDarkMode }) {
  const s = getStyles(theme, isDarkMode);
  const [token, setToken] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={s.card}>
      <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', color: theme.text, fontSize: '20px', fontWeight: '700' }}>Reset Password</h2>
      <p style={{ fontSize: '13px', color: theme.textMuted, textAlign: 'center', marginTop: 0, marginBottom: '20px' }}>
        {initialToken ? 'A reset link was generated below.' : 'Paste the token from your reset link.'}
      </p>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ marginBottom: '15px' }}>
        <label style={s.label}>Reset Token</label>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required style={{ ...s.input, fontSize: '11px', wordBreak: 'break-all' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={s.label}>New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={s.input} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={s.label}>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={s.input} />
      </div>

      <button type="submit" disabled={loading} style={s.primaryBtn}>
        {loading ? 'Saving...' : 'Reset Password'}
      </button>
      <button type="button" onClick={onBack} style={s.linkBtn}>Back to login</button>
    </form>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const s = getStyles(theme, isDarkMode);

  // 'login' | 'forgot' | 'reset' | 'reset-done'
  const [mode, setMode] = useState('login');
  const [issuedToken, setIssuedToken] = useState('');

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

  if (mode === 'forgot') {
    return (
      <div style={s.wrapper}>
        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <ForgotPasswordForm
          theme={theme}
          isDarkMode={isDarkMode}
          onTokenIssued={(token) => { setIssuedToken(token); setMode('reset'); }}
          onBack={() => setMode('login')}
        />
      </div>
    );
  }

  if (mode === 'reset') {
    return (
      <div style={s.wrapper}>
        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <ResetPasswordForm
          theme={theme}
          isDarkMode={isDarkMode}
          initialToken={issuedToken}
          onDone={() => { setIssuedToken(''); setMode('reset-done'); }}
          onBack={() => setMode('login')}
        />
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', color: theme.text }}>Welcome</h2>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textMuted }}>Please sign in with your corporate credentials</p>
        </div>

        {mode === 'reset-done' && (
          <div style={s.successBox}>
            Password reset! You can log in with your new password now.
          </div>
        )}
        {error && <div style={s.errorBox}>{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <label style={s.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            style={s.input}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={s.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={s.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ ...s.primaryBtn, backgroundColor: loading ? theme.primaryHover : theme.primary, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <button type="button" onClick={() => setMode('forgot')} style={s.linkBtn}>Forgot password?</button>
      </form>
    </div>
  );
}
