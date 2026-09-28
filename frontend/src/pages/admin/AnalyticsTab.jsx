import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getAnalyticsSummary } from '../../services/api';

// --- A small, dependency-free horizontal bar chart. No chart library is
// installed in this project, and pulling one in just for a handful of bars
// felt heavier than it needed to be, so this renders plain SVG using the
// current theme's colors, which keeps it correct in both light and dark mode. ---
function BarChart({ theme, data, colorFor, valueFormatter }) {
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    return <div style={{ color: theme.textMuted, fontSize: '13px', padding: '12px 0' }}>No data yet.</div>;
  }

  const max = Math.max(...entries.map(([, v]) => v), 1);
  const fmt = valueFormatter || ((v) => v);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {entries.map(([label, value]) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', color: theme.text }}>
            <span style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>
            <strong>{fmt(value)}</strong>
          </div>
          <div style={{ width: '100%', height: '10px', borderRadius: '5px', backgroundColor: theme.border, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max((value / max) * 100, 3)}%`,
                height: '100%',
                borderRadius: '5px',
                backgroundColor: colorFor ? colorFor(label) : theme.primary,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ theme, label, value, accent }) {
  return (
    <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '20px 22px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', flex: '1 1 180px', minWidth: '180px' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', color: theme.textMuted, marginBottom: '10px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: accent || theme.text }}>{value}</div>
    </div>
  );
}

function Panel({ theme, title, children }) {
  return (
    <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '22px 24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', flex: '1 1 380px', minWidth: '300px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>{title}</h3>
      {children}
    </div>
  );
}

const statusColors = { active: '#22c55e', inactive: '#94a3b8', on_leave: '#f59e0b', terminated: '#ef4444' };
const leaveStatusColors = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

export default function AnalyticsTab() {
  const { theme, isDarkMode } = useTheme();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div style={{ color: theme.textMuted, padding: '24px 0' }}>Loading analytics...</div>;
  }

  if (error) {
    return (
      <div style={{ color: isDarkMode ? '#fca5a5' : '#991b1b', backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2', padding: '14px 18px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}`, fontSize: '14px' }}>
        {error}
      </div>
    );
  }

  if (!summary) return null;



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={load}
          style={{ padding: '8px 16px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* --- Top-line stat cards --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <StatCard theme={theme} label="Total Employees" value={summary.totalEmployees} />
        <StatCard theme={theme} label="Active" value={summary.activeEmployees} accent="#22c55e" />
        <StatCard theme={theme} label="On Leave" value={summary.onLeaveEmployees} accent="#f59e0b" />
        <StatCard theme={theme} label="Pending Leave Requests" value={summary.pendingLeaveRequests} accent={theme.primary} />
        <StatCard theme={theme} label="High Attrition Risk" value={summary.highAttritionRiskCount} accent="#ef4444" />
        <StatCard theme={theme} label="Medium Attrition Risk" value={summary.mediumAttritionRiskCount} accent="#f59e0b" />
      </div>



      {/* --- Charts --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <Panel theme={theme} title="Headcount by Department">
          <BarChart theme={theme} data={summary.headcountByDepartment} />
        </Panel>

        <Panel theme={theme} title="Employees by Status">
          <BarChart theme={theme} data={summary.employeesByStatus} colorFor={(label) => statusColors[label] || theme.primary} />
        </Panel>

        <Panel theme={theme} title="Leave Requests by Status">
          <BarChart theme={theme} data={summary.leaveRequestsByStatus} colorFor={(label) => leaveStatusColors[label] || theme.primary} />
        </Panel>

        <Panel theme={theme} title="Leave Requests by Type">
          <BarChart theme={theme} data={summary.leaveRequestsByType} />
        </Panel>
      </div>
    </div>
  );
}
