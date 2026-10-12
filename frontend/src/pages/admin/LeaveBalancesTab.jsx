import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getEmployees, getLeaveBalances, updateLeaveBalance, exportToCsv } from '../../services/api';
import { IconDownload } from '../../components/Icons';

const btn = (bg) => ({ padding: '8px 16px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' });
const smallBtn = (bg) => ({ padding: '4px 8px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' });

function remainingColor(remaining) {
  if (remaining <= 0) return '#dc3545';
  if (remaining <= 3) return '#fd7e14';
  return '#28a745';
}

export default function LeaveBalancesTab() {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };
  const label = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text };
  const input = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' };

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingBalance, setEditingBalance] = useState(null);
  const [editTotal, setEditTotal] = useState('');
  const [editUsed, setEditUsed] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const loadBalances = async (employeeId, y) => {
    if (!employeeId) { setBalances([]); return; }
    setLoading(true);
    setError('');
    try {
      const data = await getLeaveBalances({ employeeId, year: y });
      setBalances(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmployeeId) loadBalances(selectedEmployeeId, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, year]);

  const openEdit = (balance) => {
    setEditingBalance(balance);
    setEditTotal(String(balance.totalDays));
    setEditUsed(String(balance.usedDays));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateLeaveBalance(editingBalance.balanceId, {
        totalDays: Number(editTotal),
        usedDays: Number(editUsed)
      });
      setEditingBalance(null);
      loadBalances(selectedEmployeeId, year);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update leave balance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '16px' }}>
        Track each employee's yearly leave allotment vs. what they've used. Balances are seeded automatically the first time
        they're viewed, and are enforced when employees submit leave requests.
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ minWidth: '260px' }}>
          <label style={label}>Employee</label>
          <select style={input} value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
            <option value="">Select an employee...</option>
            {employees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '120px' }}>
          <label style={label}>Year</label>
          <input type="number" style={input} value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
        {selectedEmployeeId && balances.length > 0 && (
          <button
            onClick={() => {
              const currentEmp = employees.find(e => String(e.employeeId) === String(selectedEmployeeId));
              const empName = currentEmp ? `${currentEmp.firstName}_${currentEmp.lastName}` : 'employee';
              const rows = balances.map(b => ({
                Employee: currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : '',
                Year: b.year,
                'Leave Type': b.leaveType,
                'Total Days': b.totalDays,
                'Used Days': b.usedDays,
                Remaining: b.totalDays - b.usedDays,
              }));
              exportToCsv(`leave_balances_${empName}_${year}.csv`, rows);
            }}
            style={{ ...btn(theme.cardBg), color: theme.text, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '6px', height: '38px', boxSizing: 'border-box' }}
          >
            <IconDownload size={14} /> Export CSV
          </button>
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

      {!selectedEmployeeId && <div style={emptyRow}>Select an employee to view their leave balances.</div>}

      {selectedEmployeeId && (
        <table style={table}>
          <thead style={thead}>
            <tr>
              <th style={th}>Leave Type</th>
              <th style={th}>Total Days</th>
              <th style={th}>Used Days</th>
              <th style={th}>Remaining</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td style={emptyRow} colSpan={5}>Loading...</td></tr>}
            {!loading && balances.length === 0 && <tr><td style={emptyRow} colSpan={5}>No balances found.</td></tr>}
            {!loading && balances.map(b => {
              const remaining = b.totalDays - b.usedDays;
              return (
                <tr key={b.balanceId} style={row}>
                  <td style={{ ...td, textTransform: 'capitalize' }}>{b.leaveType}</td>
                  <td style={td}>{b.totalDays}</td>
                  <td style={td}>{b.usedDays}</td>
                  <td style={{ ...td, color: remainingColor(remaining), fontWeight: 'bold' }}>{remaining}</td>
                  <td style={td}>
                    <button style={smallBtn('#007bff')} onClick={() => openEdit(b)}>Adjust</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {editingBalance && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={saveEdit} style={{ backgroundColor: theme.cardBg, color: theme.text, padding: '30px', borderRadius: '8px', width: '380px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ marginTop: 0 }}>Adjust Balance: <span style={{ textTransform: 'capitalize' }}>{editingBalance.leaveType}</span></h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={label}>Total Days Allotted</label>
              <input type="number" min="0" style={input} value={editTotal} onChange={(e) => setEditTotal(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Used Days</label>
              <input type="number" min="0" style={input} value={editUsed} onChange={(e) => setEditUsed(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setEditingBalance(null)} style={btn('#6c757d')}>Cancel</button>
              <button type="submit" disabled={saving} style={btn('#007bff')}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
