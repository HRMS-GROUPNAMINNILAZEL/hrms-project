import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getAttendance, getEmployees, deleteAttendance, exportToCsv } from '../../services/api';
import Pagination from './Pagination';

const PAGE_SIZE = 10;

export default function AttendanceTab() {
  const { theme, isDarkMode } = useTheme();

  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}` };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };
  const label = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text };
  const input = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none' };
  const btn = (bg) => ({ padding: '10px 18px', backgroundColor: bg, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' });
  const smallBtn = (bg) => ({ padding: '7px 14px', backgroundColor: bg, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', marginRight: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' });
  const badge = (bg, color) => ({ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', backgroundColor: bg, color, display: 'inline-flex', alignItems: 'center' });

  const statusBadge = (status) => {
    const colors = {
      present: { bg: isDarkMode ? '#064e3b' : '#d1fae5', fg: isDarkMode ? '#6ee7b7' : '#065f46' },
      late:    { bg: isDarkMode ? '#78350f' : '#fef3c7', fg: isDarkMode ? '#fbbf24' : '#92400e' },
      absent:  { bg: isDarkMode ? '#7f1d1d' : '#fee2e2', fg: isDarkMode ? '#fca5a5' : '#991b1b' },
      on_leave:{ bg: isDarkMode ? '#1e3a5f' : '#dbeafe', fg: isDarkMode ? '#93c5fd' : '#1e40af' },
    };
    const c = colors[status] || colors.present;
    return badge(c.bg, c.fg);
  };

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [attData, empData] = await Promise.all([getAttendance(), getEmployees()]);
      setRecords(attData);
      setEmployees(empData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await deleteAttendance(id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleExport = () => {
    const rows = filtered.map(r => ({
      Employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      Department: r.employee?.department?.departmentName || '',
      Date: r.date,
      'Time In': r.timeIn || '',
      'Time Out': r.timeOut || '',
      Status: r.status,
    }));
    exportToCsv('attendance_report.csv', rows);
  };

  // Filter + search
  const filtered = records.filter(r => {
    const empName = r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '';
    const q = search.trim().toLowerCase();
    const matchSearch = !q || empName.toLowerCase().includes(q) || (r.employee?.department?.departmentName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchDateFrom = !dateFrom || r.date >= dateFrom;
    const matchDateTo = !dateTo || r.date <= dateTo;
    return matchSearch && matchStatus && matchDateFrom && matchDateTo;
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const onLeaveCount = records.filter(r => r.status === 'on_leave').length;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>Loading attendance records...</div>;

  return (
    <div>
      {error && (
        <div style={{ color: isDarkMode ? '#fca5a5' : '#b91c1c', marginBottom: '20px', backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}` }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Present', count: presentCount, color: isDarkMode ? '#6ee7b7' : '#065f46', bg: isDarkMode ? '#064e3b' : '#d1fae5' },
          { label: 'Late', count: lateCount, color: isDarkMode ? '#fbbf24' : '#92400e', bg: isDarkMode ? '#78350f' : '#fef3c7' },
          { label: 'Absent', count: absentCount, color: isDarkMode ? '#fca5a5' : '#991b1b', bg: isDarkMode ? '#7f1d1d' : '#fee2e2' },
          { label: 'On Leave', count: onLeaveCount, color: isDarkMode ? '#93c5fd' : '#1e40af', bg: isDarkMode ? '#1e3a5f' : '#dbeafe' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg, padding: '20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: c.color }}>{c.count}</div>
            <div style={{ fontSize: '13px', color: c.color, opacity: 0.8, marginTop: '4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={label}>Search Employee</label>
          <input type="text" placeholder="Name or department..." value={search} onChange={e => setSearch(e.target.value)} style={input} />
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={label}>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={input}>
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={label}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={input} />
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={label}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={input} />
        </div>
        <button onClick={handleExport} style={btn('#0ea5e9')}>📥 Export CSV</button>
      </div>

      {/* Table */}
      <table style={table}>
        <thead>
          <tr style={thead}>
            <th style={th}>Employee</th>
            <th style={th}>Department</th>
            <th style={th}>Date</th>
            <th style={th}>Time In</th>
            <th style={th}>Time Out</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan="7" style={emptyRow}>No attendance records found</td></tr>
          ) : paged.map(r => (
            <tr key={r.attendanceId} style={row}>
              <td style={td}>{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'N/A'}</td>
              <td style={td}>{r.employee?.department?.departmentName || '—'}</td>
              <td style={td}>{r.date}</td>
              <td style={td}>{r.timeIn || '—'}</td>
              <td style={td}>{r.timeOut || '—'}</td>
              <td style={td}><span style={statusBadge(r.status)}>{r.status.replace('_', ' ')}</span></td>
              <td style={td}>
                <button onClick={() => handleDelete(r.attendanceId)} style={smallBtn('#dc3545')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
