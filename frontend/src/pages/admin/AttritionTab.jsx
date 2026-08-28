import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getAttritionIndicators, computeAttritionForAll } from '../../services/api';

const btn = (bg) => ({ padding: '8px 16px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' });
const badge = (bg, color) => ({ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', backgroundColor: bg, color, textTransform: 'capitalize', fontWeight: 'bold' });

const riskBadge = (level) => {
  if (level === 'high') return badge('#f8d7da', '#721c24');
  if (level === 'medium') return badge('#fff3cd', '#856404');
  return badge('#d4edda', '#155724');
};

const trendBadge = (trend) => {
  if (!trend) return <span style={{ color: '#adb5bd' }}>—</span>;
  if (trend === 'declining') return <span style={{ color: '#dc3545' }}>▼ Declining</span>;
  if (trend === 'improving') return <span style={{ color: '#28a745' }}>▲ Improving</span>;
  return <span style={{ color: '#6c757d' }}>▬ Stable</span>;
};

export default function AttritionTab() {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };

  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState('');
  const [lastComputed, setLastComputed] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAttritionIndicators({ latest: true });
      setIndicators(data);
      if (data.length > 0) setLastComputed(data[0].snapshotDate);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attrition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCompute = async () => {
    setComputing(true);
    setError('');
    try {
      await computeAttritionForAll();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to compute attrition risk');
    } finally {
      setComputing(false);
    }
  };

  const highCount = indicators.filter(i => i.riskLevel === 'high').length;
  const mediumCount = indicators.filter(i => i.riskLevel === 'medium').length;
  const lowCount = indicators.filter(i => i.riskLevel === 'low').length;

  return (
    <div>
      <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '16px' }}>
        A transparent heuristic — not a black-box model — that scores flight risk from recent late-attendance count,
        leave frequency, and performance trend. Weights are simple by design so the reasoning behind every score is inspectable.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...badge('#f8d7da', '#721c24'), fontSize: '14px', padding: '8px 16px' }}>High Risk: {highCount}</div>
          <div style={{ ...badge('#fff3cd', '#856404'), fontSize: '14px', padding: '8px 16px' }}>Medium Risk: {mediumCount}</div>
          <div style={{ ...badge('#d4edda', '#155724'), fontSize: '14px', padding: '8px 16px' }}>Low Risk: {lowCount}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {lastComputed && <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Last computed: {lastComputed}</div>}
          <button onClick={handleCompute} disabled={computing} style={btn('#17a2b8')}>
            {computing ? 'Computing...' : '↻ Recompute Risk Scores'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

      <table style={table}>
        <thead style={thead}>
          <tr>
            <th style={th}>Employee</th>
            <th style={th}>Late Days (30d)</th>
            <th style={th}>Leave Requests (30d)</th>
            <th style={th}>Performance Trend</th>
            <th style={th}>Risk Score</th>
            <th style={th}>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={6}>Loading...</td></tr>}
          {!loading && indicators.length === 0 && (
            <tr><td style={emptyRow} colSpan={6}>No snapshots yet — click "Recompute Risk Scores" to generate the first one.</td></tr>
          )}
          {!loading && indicators.map(i => (
            <tr key={i.indicatorId} style={row}>
              <td style={td}>{i.employee ? `${i.employee.firstName} ${i.employee.lastName}` : '—'}</td>
              <td style={td}>{i.lateAttendanceCount30d}</td>
              <td style={td}>{i.leaveFrequency30d}</td>
              <td style={td}>{trendBadge(i.performanceTrend)}</td>
              <td style={td}><strong>{i.riskScore}</strong> / 100</td>
              <td style={td}><span style={riskBadge(i.riskLevel)}>{i.riskLevel}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
