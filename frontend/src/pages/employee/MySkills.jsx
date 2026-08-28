import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeSkills, getSkillGapAnalysis } from '../../services/api';

const badge = (bg, color) => ({ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: bg, color, textTransform: 'capitalize' });

const gapStatusBadge = (status) => {
  if (status === 'met') return badge('#d4edda', '#155724');
  if (status === 'below') return badge('#fff3cd', '#856404');
  return badge('#f8d7da', '#721c24');
};

export default function MySkills({ employeeId }) {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };

  const [mySkills, setMySkills] = useState([]);
  const [gap, setGap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([getEmployeeSkills({ employeeId }), getSkillGapAnalysis(employeeId)])
      .then(([skills, gapResult]) => { setMySkills(skills); setGap(gapResult); })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load skills'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

      <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>My Skills</h3>
      <table style={{ ...table, marginBottom: '30px' }}>
        <thead style={thead}><tr><th style={th}>Skill</th><th style={th}>Proficiency</th><th style={th}>Acquired</th></tr></thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={3}>Loading...</td></tr>}
          {!loading && mySkills.length === 0 && <tr><td style={emptyRow} colSpan={3}>No skills on file yet — ask HR to add what you know.</td></tr>}
          {!loading && mySkills.map(s => (
            <tr key={s.employeeSkillId} style={row}>
              <td style={td}>{s.skill?.skillName}</td>
              <td style={{ ...td, textTransform: 'capitalize' }}>{s.proficiencyLevel}</td>
              <td style={td}>{s.acquiredDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Skills Needed For My Role</h3>
      <table style={table}>
        <thead style={thead}><tr><th style={th}>Skill</th><th style={th}>Required Level</th><th style={th}>My Level</th><th style={th}>Status</th></tr></thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={4}>Loading...</td></tr>}
          {!loading && gap.length === 0 && <tr><td style={emptyRow} colSpan={4}>No skill requirements defined for your role yet.</td></tr>}
          {!loading && gap.map((g, idx) => (
            <tr key={idx} style={row}>
              <td style={td}>{g.skill?.skillName}</td>
              <td style={{ ...td, textTransform: 'capitalize' }}>{g.requiredLevel}</td>
              <td style={{ ...td, textTransform: 'capitalize' }}>{g.currentLevel || '— not on file —'}</td>
              <td style={td}><span style={gapStatusBadge(g.status)}>{g.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
