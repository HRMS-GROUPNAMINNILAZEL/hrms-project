import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getLeaveBalances } from '../../services/api';


function remainingColor(remaining) {
  if (remaining <= 0) return '#dc3545';
  if (remaining <= 3) return '#fd7e14';
  return '#28a745';
}

export default function MyLeaveBalances({ employeeId }) {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getLeaveBalances({ employeeId, year })
      .then(setBalances)
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load leave balances'))
      .finally(() => setLoading(false));
  }, [employeeId, year]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>My {year} Leave Balance</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '13px' }}>{error}</div>}
      <table style={table}>
        <thead style={thead}>
          <tr>
            <th style={th}>Leave Type</th>
            <th style={th}>Total</th>
            <th style={th}>Used</th>
            <th style={th}>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={4}>Loading...</td></tr>}
          {!loading && balances.length === 0 && <tr><td style={emptyRow} colSpan={4}>No balance data yet.</td></tr>}
          {!loading && balances.map(b => {
            const remaining = b.totalDays - b.usedDays;
            return (
              <tr key={b.balanceId} style={row}>
                <td style={{ ...td, textTransform: 'capitalize' }}>{b.leaveType}</td>
                <td style={td}>{b.totalDays}</td>
                <td style={td}>{b.usedDays}</td>
                <td style={{ ...td, color: remainingColor(remaining), fontWeight: 'bold' }}>{remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
