import React, { useState } from 'react';

export default function EmployeeDirectory({ employees, theme, isDarkMode }) {
  const [search, setSearch] = useState('');

  const filtered = employees.filter(emp => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      (emp.position || '').toLowerCase().includes(q) ||
      (emp.department?.departmentName || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name, position, or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: '400px', padding: '10px 14px', boxSizing: 'border-box',
          borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px',
          color: theme.text, backgroundColor: theme.inputBg, outline: 'none', marginBottom: '20px'
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {filtered.map(emp => (
          <div key={emp.employeeId} style={{
            backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px',
            padding: '20px', textAlign: 'center', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            cursor: 'default', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 12px',
              overflow: 'hidden', border: `2px solid ${theme.border}`,
              backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {emp.profilePhoto ? (
                <img src={emp.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '24px' }}>👤</span>
              )}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>
              {emp.firstName} {emp.lastName}
            </div>
            <div style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '8px' }}>
              {emp.position || 'No position'}
            </div>
            <div style={{
              display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '11px',
              fontWeight: '500', backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
              color: theme.textMuted, border: `1px solid ${theme.border}`
            }}>
              🏢 {emp.department?.departmentName || 'Unassigned'}
            </div>
            {emp.contactNumber && (
              <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '8px' }}>
                📞 {emp.contactNumber}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: theme.textMuted }}>
            No employees found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
