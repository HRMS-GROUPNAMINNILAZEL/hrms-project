import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getPerformanceReviews } from '../../services/api';


function ratingColor(rating) {
  if (rating === null || rating === undefined) return '#6c757d';
  const r = Number(rating);
  if (r >= 4) return '#28a745';
  if (r >= 3) return '#fd7e14';
  return '#dc3545';
}

export default function MyPerformanceReviews({ employeeId }) {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getPerformanceReviews({ employeeId })
      .then(setReviews)
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load performance reviews'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      <table style={table}>
        <thead style={thead}>
          <tr>
            <th style={th}>Reviewer</th>
            <th style={th}>Period</th>
            <th style={th}>Rating</th>
            <th style={th}>Comments</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={4}>Loading...</td></tr>}
          {!loading && reviews.length === 0 && <tr><td style={emptyRow} colSpan={4}>No performance reviews on file yet.</td></tr>}
          {!loading && reviews.map(r => (
            <tr key={r.reviewId} style={row}>
              <td style={td}>{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '—'}</td>
              <td style={td}>{r.reviewPeriod}</td>
              <td style={{ ...td, color: ratingColor(r.rating), fontWeight: 'bold' }}>{r.rating ?? '—'} / 5</td>
              <td style={td}>{r.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
