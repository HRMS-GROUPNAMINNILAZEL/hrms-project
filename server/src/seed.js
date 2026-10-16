const bcrypt = require('bcryptjs');
const {
  User, Employee, Department, Attendance, Skill, EmployeeSkill,
  RoleRequiredSkill, LeaveBalance, LeaveRequest, Notification,
  PerformanceReview, AttritionIndicator, Counter
} = require('./models');

async function seedDatabase() {
  console.log('--- Starting Complete HRMS Database Seed ---');

  // Clear existing collections for a clean, fresh, synchronized seed
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Attendance.deleteMany({}),
    Skill.deleteMany({}),
    EmployeeSkill.deleteMany({}),
    RoleRequiredSkill.deleteMany({}),
    LeaveBalance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    Notification.deleteMany({}),
    PerformanceReview.deleteMany({}),
    AttritionIndicator.deleteMany({}),
    Counter.deleteMany({})
  ]);

  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  // 1. Users
  const users = [
    // Admin user (can log in as admin / admin123 or admin / password123)
    { userId: 100, username: 'admin', passwordHash: adminPasswordHash, email: 'admin@hrms.local', role: 'admin', isActive: true, createdAt: new Date('2024-01-01') },
    // Employee accounts
    { userId: 1, username: 'jdela_cruz', passwordHash: defaultPasswordHash, email: 'juan.delacruz@company.com', role: 'employee', isActive: true, createdAt: new Date('2024-03-15') },
    { userId: 2, username: 'maria_santos', passwordHash: defaultPasswordHash, email: 'maria.santos@company.com', role: 'hr', isActive: true, createdAt: new Date('2022-01-10') },
    { userId: 3, username: 'carlos_reyes', passwordHash: defaultPasswordHash, email: 'carlos.reyes@company.com', role: 'manager', isActive: true, createdAt: new Date('2022-06-01') },
    { userId: 4, username: 'elena_bautista', passwordHash: defaultPasswordHash, email: 'elena.bautista@company.com', role: 'manager', isActive: true, createdAt: new Date('2023-04-12') },
    { userId: 5, username: 'Andres', passwordHash: defaultPasswordHash, email: 'andres.santiago@company.com', role: 'hr', isActive: true, createdAt: new Date('2024-02-01') },
    { userId: 6, username: 'Jacob', passwordHash: defaultPasswordHash, email: 'jacob.santarin@company.com', role: 'hr', isActive: true, createdAt: new Date('2023-11-15') },
    { userId: 7, username: 'mark_tan', passwordHash: defaultPasswordHash, email: 'mark.tan@company.com', role: 'manager', isActive: true, createdAt: new Date('2022-09-01') },
    { userId: 8, username: 'patricia_gomez', passwordHash: defaultPasswordHash, email: 'patricia.gomez@company.com', role: 'employee', isActive: true, createdAt: new Date('2025-01-20') },
    { userId: 9, username: 'david_kim', passwordHash: defaultPasswordHash, email: 'david.kim@company.com', role: 'manager', isActive: true, createdAt: new Date('2023-08-01') },
    { userId: 10, username: 'sarah_jenkins', passwordHash: defaultPasswordHash, email: 'sarah.jenkins@company.com', role: 'employee', isActive: true, createdAt: new Date('2024-05-10') },
    { userId: 11, username: 'rafael_cruz', passwordHash: defaultPasswordHash, email: 'rafael.cruz@company.com', role: 'employee', isActive: true, createdAt: new Date('2023-03-01') },
    { userId: 12, username: 'axzel_andres', passwordHash: defaultPasswordHash, email: 'axzel.andres@company.com', role: 'employee', isActive: true, createdAt: new Date('2024-07-01') }
  ];
  await User.insertMany(users);

  // 2. Departments
  const departments = [
    { departmentId: 1, departmentName: 'Human Resources', departmentHeadId: 2 },
    { departmentId: 2, departmentName: 'Engineering', departmentHeadId: 3 },
    { departmentId: 3, departmentName: 'Finance & Accounting', departmentHeadId: 4 },
    { departmentId: 4, departmentName: 'Sales & Business Development', departmentHeadId: 7 },
    { departmentId: 5, departmentName: 'Product & Design', departmentHeadId: 9 },
    { departmentId: 6, departmentName: 'Operations & IT', departmentHeadId: 11 }
  ];
  await Department.insertMany(departments);

  // 3. Employees with realistic profiles
  const employees = [
    {
      employeeId: 1,
      userId: 1,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      departmentId: 2,
      position: 'Software Engineer',
      managerId: 3,
      hireDate: '2024-03-15',
      status: 'active',
      contactNumber: '0917-823-4567',
      address: 'Makati City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 2,
      userId: 2,
      firstName: 'Maria',
      lastName: 'Santos',
      departmentId: 1,
      position: 'HR Director',
      managerId: null,
      hireDate: '2022-01-10',
      status: 'active',
      contactNumber: '0918-934-5678',
      address: 'Quezon City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 3,
      userId: 3,
      firstName: 'Carlos',
      lastName: 'Reyes',
      departmentId: 2,
      position: 'Lead Software Architect',
      managerId: null,
      hireDate: '2022-06-01',
      status: 'active',
      contactNumber: '0919-456-7890',
      address: 'Pasig City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 4,
      userId: 4,
      firstName: 'Elena',
      lastName: 'Bautista',
      departmentId: 3,
      position: 'Finance Manager',
      managerId: null,
      hireDate: '2023-04-12',
      status: 'active',
      contactNumber: '0920-567-8901',
      address: 'Taguig City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 5,
      userId: 5,
      firstName: 'Andres',
      lastName: 'Santiago',
      departmentId: 1,
      position: 'Senior HR Analyst',
      managerId: 2,
      hireDate: '2024-02-01',
      status: 'active',
      contactNumber: '0921-678-9012',
      address: 'Bacoor, Cavite',
      profilePhoto: null
    },
    {
      employeeId: 6,
      userId: 6,
      firstName: 'Jacob',
      lastName: 'Santarin',
      departmentId: 1,
      position: 'HR Operations Lead',
      managerId: 2,
      hireDate: '2023-11-15',
      status: 'active',
      contactNumber: '0922-789-0123',
      address: 'Mandaluyong City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 7,
      userId: 7,
      firstName: 'Mark Anthony',
      lastName: 'Tan',
      departmentId: 4,
      position: 'Sales Director',
      managerId: null,
      hireDate: '2022-09-01',
      status: 'active',
      contactNumber: '0923-890-1234',
      address: 'San Juan City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 8,
      userId: 8,
      firstName: 'Patricia',
      lastName: 'Gomez',
      departmentId: 4,
      position: 'Account Executive',
      managerId: 7,
      hireDate: '2025-01-20',
      status: 'on_leave',
      contactNumber: '0924-901-2345',
      address: 'Parañaque City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 9,
      userId: 9,
      firstName: 'David',
      lastName: 'Kim',
      departmentId: 5,
      position: 'Head of Product',
      managerId: null,
      hireDate: '2023-08-01',
      status: 'active',
      contactNumber: '0925-012-3456',
      address: 'BGC, Taguig City',
      profilePhoto: null
    },
    {
      employeeId: 10,
      userId: 10,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      departmentId: 5,
      position: 'Senior UI/UX Designer',
      managerId: 9,
      hireDate: '2024-05-10',
      status: 'active',
      contactNumber: '0926-123-4567',
      address: 'Muntinlupa City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 11,
      userId: 11,
      firstName: 'Rafael',
      lastName: 'Cruz',
      departmentId: 6,
      position: 'DevOps & Infrastructure Lead',
      managerId: null,
      hireDate: '2023-03-01',
      status: 'active',
      contactNumber: '0927-234-5678',
      address: 'Caloocan City, Metro Manila',
      profilePhoto: null
    },
    {
      employeeId: 12,
      userId: 12,
      firstName: 'Axzel Aze',
      lastName: 'Andres',
      departmentId: 3,
      position: 'Senior Accountant',
      managerId: 4,
      hireDate: '2024-07-01',
      status: 'active',
      contactNumber: '0928-345-6789',
      address: 'Imus, Cavite',
      profilePhoto: null
    }
  ];
  await Employee.insertMany(employees);

  // 4. Skills Catalog
  const skills = [
    { skillId: 1, skillName: 'React & Frontend Architecture', category: 'technical' },
    { skillId: 2, skillName: 'Node.js & Express API Development', category: 'technical' },
    { skillId: 3, skillName: 'MongoDB & Database Modeling', category: 'technical' },
    { skillId: 4, skillName: 'Docker & Containerization', category: 'technical' },
    { skillId: 5, skillName: 'Cloud Infrastructure (AWS)', category: 'technical' },
    { skillId: 6, skillName: 'UI/UX & Design Systems', category: 'technical' },
    { skillId: 7, skillName: 'Financial Modeling & Forecasting', category: 'technical' },
    { skillId: 8, skillName: 'Taxation & Regulatory Compliance', category: 'technical' },
    { skillId: 9, skillName: 'Python & Data Analysis', category: 'technical' },
    { skillId: 10, skillName: 'Team Leadership & Mentoring', category: 'soft' },
    { skillId: 11, skillName: 'Cross-Functional Communication', category: 'soft' },
    { skillId: 12, skillName: 'Conflict Resolution & Negotiation', category: 'soft' },
    { skillId: 13, skillName: 'Strategic Planning & Execution', category: 'soft' },
    { skillId: 14, skillName: 'Client Relationship Management', category: 'soft' },
    { skillId: 15, skillName: 'AWS Certified Solutions Architect', category: 'certification' },
    { skillId: 16, skillName: 'CPA (Certified Public Accountant)', category: 'certification' },
    { skillId: 17, skillName: 'SHRM-CP HR Certification', category: 'certification' },
    { skillId: 18, skillName: 'PMP Certification', category: 'certification' }
  ];
  await Skill.insertMany(skills);

  // 5. Role Required Skills
  const roleRequiredSkills = [
    // Software Engineer
    { id: 1, position: 'Software Engineer', departmentId: 2, skillId: 1, requiredLevel: 'intermediate' },
    { id: 2, position: 'Software Engineer', departmentId: 2, skillId: 2, requiredLevel: 'intermediate' },
    { id: 3, position: 'Software Engineer', departmentId: 2, skillId: 3, requiredLevel: 'intermediate' },
    { id: 4, position: 'Software Engineer', departmentId: 2, skillId: 11, requiredLevel: 'intermediate' },

    // Lead Software Architect
    { id: 5, position: 'Lead Software Architect', departmentId: 2, skillId: 2, requiredLevel: 'expert' },
    { id: 6, position: 'Lead Software Architect', departmentId: 2, skillId: 4, requiredLevel: 'expert' },
    { id: 7, position: 'Lead Software Architect', departmentId: 2, skillId: 5, requiredLevel: 'expert' },
    { id: 8, position: 'Lead Software Architect', departmentId: 2, skillId: 10, requiredLevel: 'expert' },
    { id: 9, position: 'Lead Software Architect', departmentId: 2, skillId: 15, requiredLevel: 'expert' },

    // HR Director
    { id: 10, position: 'HR Director', departmentId: 1, skillId: 10, requiredLevel: 'expert' },
    { id: 11, position: 'HR Director', departmentId: 1, skillId: 12, requiredLevel: 'expert' },
    { id: 12, position: 'HR Director', departmentId: 1, skillId: 13, requiredLevel: 'expert' },
    { id: 13, position: 'HR Director', departmentId: 1, skillId: 17, requiredLevel: 'expert' },

    // Senior HR Analyst
    { id: 14, position: 'Senior HR Analyst', departmentId: 1, skillId: 11, requiredLevel: 'intermediate' },
    { id: 15, position: 'Senior HR Analyst', departmentId: 1, skillId: 12, requiredLevel: 'intermediate' },
    { id: 16, position: 'Senior HR Analyst', departmentId: 1, skillId: 9, requiredLevel: 'intermediate' },

    // HR Operations Lead
    { id: 17, position: 'HR Operations Lead', departmentId: 1, skillId: 10, requiredLevel: 'intermediate' },
    { id: 18, position: 'HR Operations Lead', departmentId: 1, skillId: 11, requiredLevel: 'intermediate' },
    { id: 19, position: 'HR Operations Lead', departmentId: 1, skillId: 12, requiredLevel: 'intermediate' },

    // Finance Manager
    { id: 20, position: 'Finance Manager', departmentId: 3, skillId: 7, requiredLevel: 'expert' },
    { id: 21, position: 'Finance Manager', departmentId: 3, skillId: 8, requiredLevel: 'expert' },
    { id: 22, position: 'Finance Manager', departmentId: 3, skillId: 16, requiredLevel: 'expert' },
    { id: 23, position: 'Finance Manager', departmentId: 3, skillId: 10, requiredLevel: 'intermediate' },

    // Senior Accountant
    { id: 24, position: 'Senior Accountant', departmentId: 3, skillId: 7, requiredLevel: 'intermediate' },
    { id: 25, position: 'Senior Accountant', departmentId: 3, skillId: 8, requiredLevel: 'intermediate' },
    { id: 26, position: 'Senior Accountant', departmentId: 3, skillId: 16, requiredLevel: 'intermediate' },

    // Sales Director
    { id: 27, position: 'Sales Director', departmentId: 4, skillId: 14, requiredLevel: 'expert' },
    { id: 28, position: 'Sales Director', departmentId: 4, skillId: 12, requiredLevel: 'expert' },
    { id: 29, position: 'Sales Director', departmentId: 4, skillId: 10, requiredLevel: 'expert' },

    // Account Executive
    { id: 30, position: 'Account Executive', departmentId: 4, skillId: 14, requiredLevel: 'intermediate' },
    { id: 31, position: 'Account Executive', departmentId: 4, skillId: 11, requiredLevel: 'intermediate' },

    // Head of Product
    { id: 32, position: 'Head of Product', departmentId: 5, skillId: 13, requiredLevel: 'expert' },
    { id: 33, position: 'Head of Product', departmentId: 5, skillId: 11, requiredLevel: 'expert' },
    { id: 34, position: 'Head of Product', departmentId: 5, skillId: 10, requiredLevel: 'expert' },

    // Senior UI/UX Designer
    { id: 35, position: 'Senior UI/UX Designer', departmentId: 5, skillId: 6, requiredLevel: 'expert' },
    { id: 36, position: 'Senior UI/UX Designer', departmentId: 5, skillId: 11, requiredLevel: 'intermediate' },
    { id: 37, position: 'Senior UI/UX Designer', departmentId: 5, skillId: 1, requiredLevel: 'beginner' },

    // DevOps & Infrastructure Lead
    { id: 38, position: 'DevOps & Infrastructure Lead', departmentId: 6, skillId: 4, requiredLevel: 'expert' },
    { id: 39, position: 'DevOps & Infrastructure Lead', departmentId: 6, skillId: 5, requiredLevel: 'expert' },
    { id: 40, position: 'DevOps & Infrastructure Lead', departmentId: 6, skillId: 15, requiredLevel: 'expert' }
  ];
  await RoleRequiredSkill.insertMany(roleRequiredSkills);

  // 6. Employee Skills (Realistic mapping showcasing met, below, and missing)
  const employeeSkills = [
    // Juan Dela Cruz (Software Engineer)
    { employeeSkillId: 1, employeeId: 1, skillId: 1, proficiencyLevel: 'intermediate', acquiredDate: '2024-04-10' },
    { employeeSkillId: 2, employeeId: 1, skillId: 2, proficiencyLevel: 'intermediate', acquiredDate: '2024-05-15' },
    { employeeSkillId: 3, employeeId: 1, skillId: 3, proficiencyLevel: 'intermediate', acquiredDate: '2024-06-20' },
    { employeeSkillId: 4, employeeId: 1, skillId: 11, proficiencyLevel: 'intermediate', acquiredDate: '2024-03-20' },

    // Maria Santos (HR Director)
    { employeeSkillId: 5, employeeId: 2, skillId: 10, proficiencyLevel: 'expert', acquiredDate: '2022-03-01' },
    { employeeSkillId: 6, employeeId: 2, skillId: 12, proficiencyLevel: 'expert', acquiredDate: '2022-04-15' },
    { employeeSkillId: 7, employeeId: 2, skillId: 13, proficiencyLevel: 'expert', acquiredDate: '2022-06-01' },
    { employeeSkillId: 8, employeeId: 2, skillId: 17, proficiencyLevel: 'expert', acquiredDate: '2021-11-20' },

    // Carlos Reyes (Lead Software Architect)
    { employeeSkillId: 9, employeeId: 3, skillId: 2, proficiencyLevel: 'expert', acquiredDate: '2022-07-01' },
    { employeeSkillId: 10, employeeId: 3, skillId: 4, proficiencyLevel: 'expert', acquiredDate: '2022-08-15' },
    { employeeSkillId: 11, employeeId: 3, skillId: 5, proficiencyLevel: 'expert', acquiredDate: '2022-09-01' },
    { employeeSkillId: 12, employeeId: 3, skillId: 10, proficiencyLevel: 'expert', acquiredDate: '2023-01-10' },
    { employeeSkillId: 13, employeeId: 3, skillId: 15, proficiencyLevel: 'expert', acquiredDate: '2023-03-25' },

    // Elena Bautista (Finance Manager)
    { employeeSkillId: 14, employeeId: 4, skillId: 7, proficiencyLevel: 'expert', acquiredDate: '2023-05-01' },
    { employeeSkillId: 15, employeeId: 4, skillId: 8, proficiencyLevel: 'expert', acquiredDate: '2023-06-15' },
    { employeeSkillId: 16, employeeId: 4, skillId: 16, proficiencyLevel: 'expert', acquiredDate: '2022-10-10' },
    { employeeSkillId: 17, employeeId: 4, skillId: 10, proficiencyLevel: 'intermediate', acquiredDate: '2024-01-15' },

    // Andres Santiago (Senior HR Analyst) - Conflict Resolution is beginner (below intermediate)
    { employeeSkillId: 18, employeeId: 5, skillId: 11, proficiencyLevel: 'intermediate', acquiredDate: '2024-03-01' },
    { employeeSkillId: 19, employeeId: 5, skillId: 12, proficiencyLevel: 'beginner', acquiredDate: '2024-04-12' },
    { employeeSkillId: 20, employeeId: 5, skillId: 9, proficiencyLevel: 'intermediate', acquiredDate: '2024-08-01' },

    // Jacob Santarin (HR Operations Lead)
    { employeeSkillId: 21, employeeId: 6, skillId: 10, proficiencyLevel: 'intermediate', acquiredDate: '2023-12-01' },
    { employeeSkillId: 22, employeeId: 6, skillId: 11, proficiencyLevel: 'intermediate', acquiredDate: '2024-01-20' },
    { employeeSkillId: 23, employeeId: 6, skillId: 12, proficiencyLevel: 'intermediate', acquiredDate: '2024-03-15' },

    // Mark Anthony Tan (Sales Director)
    { employeeSkillId: 24, employeeId: 7, skillId: 14, proficiencyLevel: 'expert', acquiredDate: '2022-10-01' },
    { employeeSkillId: 25, employeeId: 7, skillId: 12, proficiencyLevel: 'expert', acquiredDate: '2023-02-15' },
    { employeeSkillId: 26, employeeId: 7, skillId: 10, proficiencyLevel: 'expert', acquiredDate: '2023-04-20' },

    // Patricia Gomez (Account Executive)
    { employeeSkillId: 27, employeeId: 8, skillId: 14, proficiencyLevel: 'intermediate', acquiredDate: '2025-02-01' },
    { employeeSkillId: 28, employeeId: 8, skillId: 11, proficiencyLevel: 'intermediate', acquiredDate: '2025-02-15' },

    // David Kim (Head of Product)
    { employeeSkillId: 29, employeeId: 9, skillId: 13, proficiencyLevel: 'expert', acquiredDate: '2023-09-01' },
    { employeeSkillId: 30, employeeId: 9, skillId: 11, proficiencyLevel: 'expert', acquiredDate: '2023-10-15' },
    { employeeSkillId: 31, employeeId: 9, skillId: 10, proficiencyLevel: 'expert', acquiredDate: '2024-02-01' },

    // Sarah Jenkins (Senior UI/UX Designer) - Missing React
    { employeeSkillId: 32, employeeId: 10, skillId: 6, proficiencyLevel: 'expert', acquiredDate: '2024-06-01' },
    { employeeSkillId: 33, employeeId: 10, skillId: 11, proficiencyLevel: 'intermediate', acquiredDate: '2024-07-15' },

    // Rafael Cruz (DevOps Lead)
    { employeeSkillId: 34, employeeId: 11, skillId: 4, proficiencyLevel: 'expert', acquiredDate: '2023-04-01' },
    { employeeSkillId: 35, employeeId: 11, skillId: 5, proficiencyLevel: 'expert', acquiredDate: '2023-06-10' },
    { employeeSkillId: 36, employeeId: 11, skillId: 15, proficiencyLevel: 'expert', acquiredDate: '2023-11-20' },

    // Axzel Aze Andres (Senior Accountant)
    { employeeSkillId: 37, employeeId: 12, skillId: 7, proficiencyLevel: 'intermediate', acquiredDate: '2024-08-01' },
    { employeeSkillId: 38, employeeId: 12, skillId: 8, proficiencyLevel: 'intermediate', acquiredDate: '2024-09-15' },
    { employeeSkillId: 39, employeeId: 12, skillId: 16, proficiencyLevel: 'intermediate', acquiredDate: '2024-05-10' }
  ];
  await EmployeeSkill.insertMany(employeeSkills);

  // 7. Performance Reviews (Multiple periods to power trends)
  const performanceReviews = [
    // Juan Dela Cruz
    { reviewId: 1, employeeId: 1, reviewerId: 3, reviewPeriod: 'Q2 2026', rating: 4.2, comments: 'Good work refactoring the core client dashboard views. Prompt in daily standups.', createdAt: new Date('2026-06-28T10:00:00Z') },
    { reviewId: 2, employeeId: 1, reviewerId: 3, reviewPeriod: 'Q3 2026', rating: 4.8, comments: 'Exceptional delivery on React performance optimizations and state management. Upward trajectory.', createdAt: new Date('2026-09-28T10:00:00Z') },

    // Andres Santiago (declining trend)
    { reviewId: 3, employeeId: 5, reviewerId: 2, reviewPeriod: 'Q2 2026', rating: 3.8, comments: 'Solid handling of mid-year HR survey rollouts.', createdAt: new Date('2026-06-25T11:00:00Z') },
    { reviewId: 4, employeeId: 5, reviewerId: 2, reviewPeriod: 'Q3 2026', rating: 2.7, comments: 'Attendance inconsistencies and missed milestones on internal employee handbook revisions.', createdAt: new Date('2026-09-25T11:00:00Z') },

    // Carlos Reyes
    { reviewId: 5, employeeId: 3, reviewerId: 2, reviewPeriod: 'Q3 2026', rating: 4.9, comments: 'Exemplary architectural leadership. Successfully designed scalable micro-frontend layout.', createdAt: new Date('2026-09-29T14:00:00Z') },

    // Elena Bautista
    { reviewId: 6, employeeId: 4, reviewerId: 2, reviewPeriod: 'Q2 2026', rating: 4.5, comments: 'Thorough quarterly budgeting and precise audit trails.', createdAt: new Date('2026-06-30T09:00:00Z') },
    { reviewId: 7, employeeId: 4, reviewerId: 2, reviewPeriod: 'Q3 2026', rating: 4.8, comments: 'Flawless execution during annual tax audit and corporate filing period.', createdAt: new Date('2026-09-30T09:00:00Z') },

    // Jacob Santarin
    { reviewId: 8, employeeId: 6, reviewerId: 2, reviewPeriod: 'Q3 2026', rating: 4.1, comments: 'Streamlined employee leave tracking workflows and proactive communications.', createdAt: new Date('2026-09-26T15:00:00Z') },

    // Patricia Gomez
    { reviewId: 9, employeeId: 8, reviewerId: 7, reviewPeriod: 'Q3 2026', rating: 4.3, comments: 'Exceeded enterprise sales pipeline targets by 15% in Q3.', createdAt: new Date('2026-09-27T16:00:00Z') },

    // Sarah Jenkins
    { reviewId: 10, employeeId: 10, reviewerId: 9, reviewPeriod: 'Q2 2026', rating: 4.4, comments: 'Modernized core design token library and accessibility styling.', createdAt: new Date('2026-06-27T13:00:00Z') },
    { reviewId: 11, employeeId: 10, reviewerId: 9, reviewPeriod: 'Q3 2026', rating: 4.7, comments: 'Outstanding collaboration with frontend engineers on design system handoff.', createdAt: new Date('2026-09-27T13:00:00Z') },

    // Rafael Cruz
    { reviewId: 12, employeeId: 11, reviewerId: 3, reviewPeriod: 'Q3 2026', rating: 4.6, comments: 'Zero production infrastructure downtime and automated CI/CD pipeline improvements.', createdAt: new Date('2026-09-28T17:00:00Z') },

    // Axzel Aze Andres
    { reviewId: 13, employeeId: 12, reviewerId: 4, reviewPeriod: 'Q2 2026', rating: 3.9, comments: 'Accurate reconciliation of account balances and financial reports.', createdAt: new Date('2026-06-29T10:30:00Z') },
    { reviewId: 14, employeeId: 12, reviewerId: 4, reviewPeriod: 'Q3 2026', rating: 4.3, comments: 'Demonstrated initiative in automating monthly depreciation schedules.', createdAt: new Date('2026-09-29T10:30:00Z') }
  ];
  await PerformanceReview.insertMany(performanceReviews);

  // 8. Attendance Records (Recent October 2026 dates)
  const attendanceRecords = [
    // Juan Dela Cruz
    { attendanceId: 1, employeeId: 1, date: '2026-10-12', timeIn: '08:55:10', timeOut: '17:35:20', status: 'present' },
    { attendanceId: 2, employeeId: 1, date: '2026-10-13', timeIn: '08:58:45', timeOut: '17:40:10', status: 'present' },
    { attendanceId: 3, employeeId: 1, date: '2026-10-14', timeIn: '09:02:15', timeOut: '18:05:00', status: 'present' },
    { attendanceId: 4, employeeId: 1, date: '2026-10-15', timeIn: '08:50:30', timeOut: '17:30:15', status: 'present' },

    // Andres Santiago (Has late arrivals for realistic attrition flight risk)
    { attendanceId: 5, employeeId: 5, date: '2026-10-12', timeIn: '09:42:10', timeOut: '18:15:30', status: 'late' },
    { attendanceId: 6, employeeId: 5, date: '2026-10-13', timeIn: '09:55:00', timeOut: '18:30:00', status: 'late' },
    { attendanceId: 7, employeeId: 5, date: '2026-10-14', timeIn: '10:05:22', timeOut: '18:45:10', status: 'late' },
    { attendanceId: 8, employeeId: 5, date: '2026-10-15', timeIn: '09:00:00', timeOut: '17:30:00', status: 'present' },

    // Carlos Reyes
    { attendanceId: 9, employeeId: 3, date: '2026-10-12', timeIn: '08:30:00', timeOut: '17:30:00', status: 'present' },
    { attendanceId: 10, employeeId: 3, date: '2026-10-13', timeIn: '08:35:10', timeOut: '17:45:00', status: 'present' },
    { attendanceId: 11, employeeId: 3, date: '2026-10-14', timeIn: '08:40:20', timeOut: '18:00:00', status: 'present' },

    // Elena Bautista
    { attendanceId: 12, employeeId: 4, date: '2026-10-12', timeIn: '08:45:00', timeOut: '17:30:00', status: 'present' },
    { attendanceId: 13, employeeId: 4, date: '2026-10-13', timeIn: '08:50:00', timeOut: '17:35:00', status: 'present' },

    // Jacob Santarin
    { attendanceId: 14, employeeId: 6, date: '2026-10-12', timeIn: '09:20:15', timeOut: '18:00:00', status: 'late' },
    { attendanceId: 15, employeeId: 6, date: '2026-10-13', timeIn: '08:55:00', timeOut: '17:40:00', status: 'present' },

    // Mark Tan
    { attendanceId: 16, employeeId: 7, date: '2026-10-12', timeIn: '09:00:00', timeOut: '18:00:00', status: 'present' },
    { attendanceId: 17, employeeId: 7, date: '2026-10-13', timeIn: '09:05:00', timeOut: '18:10:00', status: 'present' },

    // Patricia Gomez
    { attendanceId: 18, employeeId: 8, date: '2026-10-12', timeIn: '08:55:00', timeOut: '17:30:00', status: 'present' },
    { attendanceId: 19, employeeId: 8, date: '2026-10-13', timeIn: null, timeOut: null, status: 'on_leave' },

    // David Kim
    { attendanceId: 20, employeeId: 9, date: '2026-10-12', timeIn: '08:45:00', timeOut: '17:30:00', status: 'present' },

    // Sarah Jenkins
    { attendanceId: 21, employeeId: 10, date: '2026-10-12', timeIn: '08:50:00', timeOut: '17:30:00', status: 'present' },
    { attendanceId: 22, employeeId: 10, date: '2026-10-13', timeIn: '08:55:00', timeOut: '17:45:00', status: 'present' },

    // Rafael Cruz
    { attendanceId: 23, employeeId: 11, date: '2026-10-12', timeIn: '08:40:00', timeOut: '17:40:00', status: 'present' },

    // Axzel Aze Andres
    { attendanceId: 24, employeeId: 12, date: '2026-10-12', timeIn: '08:50:00', timeOut: '17:35:00', status: 'present' },
    { attendanceId: 25, employeeId: 12, date: '2026-10-13', timeIn: '08:55:00', timeOut: '17:30:00', status: 'present' }
  ];
  await Attendance.insertMany(attendanceRecords);

  // 9. Leave Balances for Year 2026 (All 12 employees across all leave types)
  const leaveTypes = ['vacation', 'sick', 'emergency', 'maternity', 'paternity', 'unpaid'];
  const allotments = { vacation: 15, sick: 15, emergency: 5, maternity: 105, paternity: 7, unpaid: 0 };
  let balanceIdCounter = 1;
  const leaveBalances = [];

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      let used = 0;
      if (emp.employeeId === 1 && lt === 'vacation') used = 3;
      if (emp.employeeId === 1 && lt === 'sick') used = 1;
      if (emp.employeeId === 5 && lt === 'vacation') used = 5;
      if (emp.employeeId === 5 && lt === 'sick') used = 3;
      if (emp.employeeId === 8 && lt === 'vacation') used = 2;
      if (emp.employeeId === 10 && lt === 'vacation') used = 4;

      leaveBalances.push({
        balanceId: balanceIdCounter++,
        employeeId: emp.employeeId,
        leaveType: lt,
        totalDays: allotments[lt],
        usedDays: used,
        year: 2026
      });
    }
  }
  await LeaveBalance.insertMany(leaveBalances);

  // 10. Leave Requests
  const leaveRequests = [
    {
      leaveId: 1,
      employeeId: 1,
      leaveType: 'vacation',
      startDate: '2026-12-22',
      endDate: '2026-12-26',
      reason: 'Year-end family holiday and recharge',
      status: 'pending',
      approvedBy: null,
      requestedAt: new Date('2026-10-10T08:30:00Z')
    },
    {
      leaveId: 2,
      employeeId: 5,
      leaveType: 'sick',
      startDate: '2026-10-05',
      endDate: '2026-10-06',
      reason: 'Acute seasonal flu and fever',
      status: 'approved',
      approvedBy: 2,
      requestedAt: new Date('2026-10-04T07:15:00Z')
    },
    {
      leaveId: 3,
      employeeId: 5,
      leaveType: 'vacation',
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      reason: 'Personal travel and vacation',
      status: 'pending',
      approvedBy: null,
      requestedAt: new Date('2026-10-12T14:00:00Z')
    },
    {
      leaveId: 4,
      employeeId: 8,
      leaveType: 'vacation',
      startDate: '2026-10-13',
      endDate: '2026-10-13',
      reason: 'Personal appointment and family errands',
      status: 'approved',
      approvedBy: 7,
      requestedAt: new Date('2026-10-11T09:00:00Z')
    },
    {
      leaveId: 5,
      employeeId: 10,
      leaveType: 'emergency',
      startDate: '2026-09-18',
      endDate: '2026-09-19',
      reason: 'Home electrical and plumbing repair emergency',
      status: 'approved',
      approvedBy: 9,
      requestedAt: new Date('2026-09-17T18:20:00Z')
    },
    {
      leaveId: 6,
      employeeId: 12,
      leaveType: 'vacation',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      reason: 'Extended weekend trip with relatives',
      status: 'pending',
      approvedBy: null,
      requestedAt: new Date('2026-10-14T11:00:00Z')
    },
    {
      leaveId: 7,
      employeeId: 3,
      leaveType: 'vacation',
      startDate: '2026-09-04',
      endDate: '2026-09-05',
      reason: 'Short family getaway',
      status: 'approved',
      approvedBy: 2,
      requestedAt: new Date('2026-08-28T09:15:00Z')
    },
    {
      leaveId: 8,
      employeeId: 6,
      leaveType: 'vacation',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      reason: 'Personal leave request during sprint delivery',
      status: 'rejected',
      approvedBy: 2,
      requestedAt: new Date('2026-09-25T14:30:00Z')
    }
  ];
  await LeaveRequest.insertMany(leaveRequests);

  // 11. Attrition Indicators (Realistic pre-computed snapshots for all active employees)
  const attritionIndicators = [
    {
      indicatorId: 1,
      employeeId: 1,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 1,
      daysSinceLastPromotion: 210,
      performanceTrend: 'improving',
      riskScore: 18,
      riskLevel: 'low',
      factors: ['Consistent on-time attendance', 'Positive upward performance trajectory'],
      computedAt: new Date()
    },
    {
      indicatorId: 2,
      employeeId: 2,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 360,
      performanceTrend: 'stable',
      riskScore: 15,
      riskLevel: 'low',
      factors: ['Executive role stability', 'Perfect attendance record'],
      computedAt: new Date()
    },
    {
      indicatorId: 3,
      employeeId: 3,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 180,
      performanceTrend: 'improving',
      riskScore: 12,
      riskLevel: 'low',
      factors: ['Core technical architect', 'Top tier review ratings'],
      computedAt: new Date()
    },
    {
      indicatorId: 4,
      employeeId: 4,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 250,
      performanceTrend: 'improving',
      riskScore: 14,
      riskLevel: 'low',
      factors: ['Exceptional performance', 'Zero attendance infractions'],
      computedAt: new Date()
    },
    {
      indicatorId: 5,
      employeeId: 5,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 3,
      leaveFrequency30d: 2,
      daysSinceLastPromotion: 450,
      performanceTrend: 'declining',
      riskScore: 78,
      riskLevel: 'high',
      factors: ['3 late arrivals in last 30d', 'Declining review ratings', 'Low recent engagement'],
      computedAt: new Date()
    },
    {
      indicatorId: 6,
      employeeId: 6,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 1,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 320,
      performanceTrend: 'stable',
      riskScore: 48,
      riskLevel: 'medium',
      factors: ['Cross-department workload pressure', 'Late arrival noted'],
      computedAt: new Date()
    },
    {
      indicatorId: 7,
      employeeId: 7,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 290,
      performanceTrend: 'stable',
      riskScore: 20,
      riskLevel: 'low',
      factors: ['Consistent department leadership', 'Stable targets achievement'],
      computedAt: new Date()
    },
    {
      indicatorId: 8,
      employeeId: 8,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 1,
      daysSinceLastPromotion: 190,
      performanceTrend: 'improving',
      riskScore: 42,
      riskLevel: 'medium',
      factors: ['Sales quota pressure', 'High travel frequency'],
      computedAt: new Date()
    },
    {
      indicatorId: 9,
      employeeId: 9,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 240,
      performanceTrend: 'stable',
      riskScore: 22,
      riskLevel: 'low',
      factors: ['Strategic roadmap owner', 'Solid delivery cadence'],
      computedAt: new Date()
    },
    {
      indicatorId: 10,
      employeeId: 10,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 1,
      daysSinceLastPromotion: 220,
      performanceTrend: 'improving',
      riskScore: 24,
      riskLevel: 'low',
      factors: ['High design system productivity', 'Positive client reception'],
      computedAt: new Date()
    },
    {
      indicatorId: 11,
      employeeId: 11,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 0,
      daysSinceLastPromotion: 270,
      performanceTrend: 'improving',
      riskScore: 16,
      riskLevel: 'low',
      factors: ['Critical infrastructure stability', 'Zero incident downtime'],
      computedAt: new Date()
    },
    {
      indicatorId: 12,
      employeeId: 12,
      snapshotDate: '2026-10-16',
      lateAttendanceCount30d: 0,
      leaveFrequency30d: 1,
      daysSinceLastPromotion: 200,
      performanceTrend: 'improving',
      riskScore: 28,
      riskLevel: 'low',
      factors: ['Accurate ledger reconciliation', 'Audit compliance met'],
      computedAt: new Date()
    }
  ];
  await AttritionIndicator.insertMany(attritionIndicators);

  // 12. Notifications
  const notifications = [
    { notificationId: 1, userId: 100, message: 'Welcome to the HRMS Admin Portal. System initialized with full dataset.', type: 'info', isRead: false, createdAt: new Date() },
    { notificationId: 2, userId: 1, message: 'Your Q3 2026 Performance Review has been submitted by Carlos Reyes.', type: 'success', isRead: false, createdAt: new Date() },
    { notificationId: 3, userId: 5, message: 'Leave request for Oct 5 - Oct 6 has been approved by Maria Santos.', type: 'info', isRead: true, createdAt: new Date() },
    { notificationId: 4, userId: 100, message: 'Leave request from Juan Dela Cruz is pending approval.', type: 'warning', isRead: false, createdAt: new Date() }
  ];
  await Notification.insertMany(notifications);

  // 13. Initialize Counters to match the highest IDs in collections
  const countersToInit = [
    { _id: 'userId', seq: 100 },
    { _id: 'employeeId', seq: 12 },
    { _id: 'departmentId', seq: 6 },
    { _id: 'skillId', seq: 18 },
    { _id: 'roleRequiredSkillId', seq: 40 },
    { _id: 'employeeSkillId', seq: 39 },
    { _id: 'reviewId', seq: 14 },
    { _id: 'attendanceId', seq: 25 },
    { _id: 'balanceId', seq: balanceIdCounter },
    { _id: 'leaveId', seq: 8 },
    { _id: 'leaveRequestId', seq: 8 },
    { _id: 'attritionIndicatorId', seq: 12 },
    { _id: 'notificationId', seq: 4 }
  ];
  for (const c of countersToInit) {
    await Counter.findByIdAndUpdate(c._id, { $set: { seq: c.seq } }, { upsert: true });
  }

  console.log('--- Database Seeding Completed Successfully! ---');
  console.log('12 realistic employees, 6 departments, 18 skills, 40 role requirements, 39 employee skills, 14 performance reviews, and 12 attrition snapshots created.');
}

module.exports = seedDatabase;
