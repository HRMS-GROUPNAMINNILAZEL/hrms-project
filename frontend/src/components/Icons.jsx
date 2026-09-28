import React from 'react';

// Clean, professional SVG icons matching the InsightX-inspired dashboard design.
// Each icon is a functional component accepting optional size and color props.

const Icon = ({ d, size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: 'middle' }} {...props}>
    <path d={d} />
  </svg>
);

// Multi-path icon for more complex shapes
const MIcon = ({ paths, size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: 'middle' }} {...props}>
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

// --- Sidebar / Navigation Icons ---
export const IconDashboard = (props) => <MIcon paths={['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10']} {...props} />;
export const IconAnalytics = (props) => <MIcon paths={['M18 20V10', 'M12 20V4', 'M6 20v-6']} {...props} />;
export const IconEmployees = (props) => <MIcon paths={['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']} {...props} />;
export const IconDirectory = (props) => <MIcon paths={['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 11h-6', 'M19 8v6']} {...props} />;
export const IconUsers = (props) => <MIcon paths={['M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M15.5 5.5l2 2', 'M17.5 3.5l2 2']} {...props} />;
export const IconDepartment = (props) => <MIcon paths={['M3 21h18', 'M9 8h1', 'M9 12h1', 'M9 16h1', 'M14 8h1', 'M14 12h1', 'M14 16h1', 'M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16']} {...props} />;
export const IconLeave = (props) => <MIcon paths={['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8']} {...props} />;
export const IconLeaveBalance = (props) => <MIcon paths={['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', 'M12 6v6l4 2']} {...props} />;
export const IconAttendance = (props) => <MIcon paths={['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2']} {...props} />;
export const IconPerformance = (props) => <MIcon paths={['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z']} {...props} />;
export const IconSkills = (props) => <MIcon paths={['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3']} {...props} />;
export const IconAttrition = (props) => <MIcon paths={['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']} {...props} />;
export const IconPassword = (props) => <MIcon paths={['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z', 'M7 11V7a5 5 0 0 1 10 0v4']} {...props} />;
export const IconProfile = (props) => <MIcon paths={['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']} {...props} />;
export const IconSettings = (props) => <MIcon paths={['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z']} {...props} />;
export const IconLogout = (props) => <MIcon paths={['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']} {...props} />;
export const IconBell = (props) => <MIcon paths={['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0']} {...props} />;
export const IconSun = (props) => <MIcon paths={['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42']} {...props} />;
export const IconMoon = (props) => <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" {...props} />;
export const IconRefresh = (props) => <MIcon paths={['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10', 'M20.49 15a9 9 0 0 1-14.85 3.36L1 14']} {...props} />;
export const IconPlus = (props) => <MIcon paths={['M12 5v14', 'M5 12h14']} {...props} />;
export const IconDownload = (props) => <MIcon paths={['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3']} {...props} />;
export const IconSearch = (props) => <MIcon paths={['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.35-4.35']} {...props} />;
export const IconCamera = (props) => <MIcon paths={['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']} {...props} />;
export const IconPrint = (props) => <MIcon paths={['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z']} {...props} />;
