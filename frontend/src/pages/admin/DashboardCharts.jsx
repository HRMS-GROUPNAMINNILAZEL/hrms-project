import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler, Title
);

// InsightX-inspired color palette
const CHART_COLORS = {
  green: '#84cc16',
  greenLight: '#a3e635',
  greenDark: '#65a30d',
  blue: '#3b82f6',
  purple: '#a855f7',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  rose: '#f43f5e',
  emerald: '#10b981',
  slate: '#64748b',
};

const DONUT_COLORS = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.amber,
  CHART_COLORS.cyan,
  CHART_COLORS.rose,
  CHART_COLORS.emerald,
  CHART_COLORS.slate,
];

export default function DashboardCharts({ employees, departments, leaveRequests, theme, isDarkMode }) {
  // ---- Data Preparation ----

  // Department headcount
  const deptCounts = {};
  departments.forEach(d => { deptCounts[d.departmentName] = 0; });
  employees.forEach(emp => {
    const name = emp.department?.departmentName || 'Unassigned';
    deptCounts[name] = (deptCounts[name] || 0) + 1;
  });

  // Employee status distribution
  const statusCounts = {};
  employees.forEach(emp => {
    const s = emp.status || 'active';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // Leave requests by type
  const leaveCounts = {};
  leaveRequests.forEach(lr => {
    const t = lr.leaveType || 'other';
    leaveCounts[t] = (leaveCounts[t] || 0) + 1;
  });

  // Summary stats
  const totalEmp = employees.length;
  const activeEmp = employees.filter(e => e.status === 'active').length;
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
  const totalDepts = departments.length;

  const statCards = [
    { label: 'Total Employees', value: totalEmp, change: '+2.5%', positive: true, color: theme.statIcon1, icon: 'employees' },
    { label: 'Active', value: activeEmp, change: activeEmp > 0 ? '+' + ((activeEmp / Math.max(totalEmp, 1)) * 100).toFixed(0) + '%' : '0%', positive: true, color: theme.statIcon2, icon: 'active' },
    { label: 'Departments', value: totalDepts, change: 'Stable', positive: true, color: theme.statIcon3, icon: 'departments' },
    { label: 'Pending Leaves', value: pendingLeaves, change: pendingLeaves > 0 ? 'Needs review' : 'All clear', positive: pendingLeaves === 0, color: theme.statIcon4, icon: 'leaves' },
  ];

  // ---- Chart Configs ----

  const donutData = {
    labels: Object.keys(deptCounts),
    datasets: [{
      data: Object.values(deptCounts),
      backgroundColor: DONUT_COLORS.slice(0, Object.keys(deptCounts).length),
      borderWidth: 0,
      hoverOffset: 6,
      spacing: 2,
    }]
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#27272a' : '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: isDarkMode ? '#3f3f46' : '#27272a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        bodyFont: { size: 13 },
        titleFont: { size: 13, weight: '600' },
      }
    }
  };

  // Modern area chart for employee status
  const statusLabels = Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const statusValues = Object.values(statusCounts);

  const statusBarData = {
    labels: statusLabels,
    datasets: [{
      label: 'Employees',
      data: statusValues,
      backgroundColor: statusLabels.map((_, i) => {
        const colors = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.rose, CHART_COLORS.blue];
        return colors[i % colors.length] + '30';
      }),
      borderColor: statusLabels.map((_, i) => {
        const colors = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.rose, CHART_COLORS.blue];
        return colors[i % colors.length];
      }),
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const statusBarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#27272a' : '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: isDarkMode ? '#3f3f46' : '#27272a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: {
        ticks: { color: theme.textMuted, font: { size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: theme.textMuted, font: { size: 11 }, stepSize: 1 },
        grid: { color: theme.chartGrid, lineWidth: 0.5 },
        border: { display: false },
      }
    }
  };

  // Leave requests — horizontal area/bar chart
  const leaveLabels = Object.keys(leaveCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const leaveValues = Object.values(leaveCounts);

  const leaveAreaData = {
    labels: leaveLabels,
    datasets: [{
      label: 'Requests',
      data: leaveValues,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return CHART_COLORS.green + '40';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, CHART_COLORS.green + '50');
        gradient.addColorStop(1, CHART_COLORS.green + '05');
        return gradient;
      },
      borderColor: CHART_COLORS.green,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: CHART_COLORS.green,
      pointBorderColor: isDarkMode ? '#18181b' : '#ffffff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    }]
  };

  const leaveAreaOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#27272a' : '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: isDarkMode ? '#3f3f46' : '#27272a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: {
        ticks: { color: theme.textMuted, font: { size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: theme.textMuted, font: { size: 11 }, stepSize: 1 },
        grid: { color: theme.chartGrid, lineWidth: 0.5 },
        border: { display: false },
        beginAtZero: true,
      }
    }
  };

  // ---- Styles ----
  const cardStyle = {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    padding: '24px',
  };

  // ---- Stat card icon SVGs ----
  const statIcons = {
    employees: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    active: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    departments: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" /><path d="M9 8h1" /><path d="M9 12h1" /><path d="M14 8h1" /><path d="M14 12h1" />
      </svg>
    ),
    leaves: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  };

  return (
    <div>
      {/* Stat Cards - InsightX style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: s.color + '18',
                border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {statIcons[s.icon](s.color)}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: theme.text, letterSpacing: '-1px', lineHeight: '1' }}>
              {s.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '6px', fontWeight: '500' }}>
              {s.label}
            </div>
            <div style={{
              fontSize: '12px',
              color: s.positive ? CHART_COLORS.green : CHART_COLORS.amber,
              marginTop: '8px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '16px', height: '16px', borderRadius: '4px',
                backgroundColor: s.positive ? CHART_COLORS.green + '18' : CHART_COLORS.amber + '18',
                fontSize: '10px',
              }}>
                {s.positive ? '↑' : '→'}
              </span>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid - InsightX layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Donut Chart - Department Breakdown */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: theme.text }}>Headcount by Department</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '180px', height: '180px', position: 'relative', flexShrink: 0 }}>
              <Doughnut data={donutData} options={donutOpts} />
              {/* Center label */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.text, lineHeight: '1' }}>
                  {totalEmp}
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>Total</div>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {Object.entries(deptCounts).map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                    }} />
                    <span style={{ fontSize: '13px', color: theme.textMuted }}>{name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{count}</span>
                    <span style={{
                      fontSize: '11px', color: theme.textMuted,
                      backgroundColor: theme.accentBg, padding: '2px 6px', borderRadius: '4px',
                    }}>
                      {totalEmp > 0 ? Math.round((count / totalEmp) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Bar Chart */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>Employee Status</h3>
          <div style={{ height: '200px' }}>
            <Bar data={statusBarData} options={statusBarOpts} />
          </div>
        </div>
      </div>

      {/* Leave Area Chart - Full width */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: theme.text }}>Leave Requests by Type</h3>
          <div style={{
            fontSize: '12px', color: theme.textMuted,
            padding: '4px 10px', borderRadius: '6px',
            backgroundColor: theme.accentBg, border: `1px solid ${theme.border}`,
          }}>
            {leaveRequests.length} total
          </div>
        </div>
        <div style={{ height: '200px' }}>
          <Line data={leaveAreaData} options={leaveAreaOpts} />
        </div>
      </div>
    </div>
  );
}
