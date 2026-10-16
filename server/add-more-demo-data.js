const mongoose = require('mongoose');
const { Employee, User, LeaveBalance, Attendance, PerformanceReview } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms_db';

const demoEmployees = [
  { username: 'demo_emp3', email: 'demo3@example.com', firstName: 'Alice', lastName: 'Developer', position: 'Senior Developer', hireDate: '2025-01-15' },
  { username: 'demo_emp4', email: 'demo4@example.com', firstName: 'Bob', lastName: 'Designer', position: 'UI Designer', hireDate: '2025-02-10' },
  { username: 'demo_emp5', email: 'demo5@example.com', firstName: 'Charlie', lastName: 'Manager', position: 'Project Manager', hireDate: '2024-06-01' }
];

const leaveTypes = ['sick', 'vacation', 'emergency'];

async function createMoreDemoData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const latestUser = await User.findOne().sort({ userId: -1 });
    const latestEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const latestBalance = await LeaveBalance.findOne().sort({ balanceId: -1 });
    const latestReview = await PerformanceReview.findOne().sort({ reviewId: -1 });
    const latestAttendance = await Attendance.findOne().sort({ attendanceId: -1 });

    let userIdCounter = latestUser ? latestUser.userId : 0;
    let employeeIdCounter = latestEmployee ? latestEmployee.employeeId : 0;
    let balanceIdCounter = latestBalance ? latestBalance.balanceId : 0;
    let reviewIdCounter = latestReview ? latestReview.reviewId : 0;
    let attendanceIdCounter = latestAttendance ? latestAttendance.attendanceId : 0;

    const reviewerId = 1;

    for (const demo of demoEmployees) {
      if (await User.findOne({ username: demo.username })) {
        console.log(`User ${demo.username} exists, skipping.`);
        continue;
      }

      userIdCounter++;
      employeeIdCounter++;
      
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await User.create({ userId: userIdCounter, username: demo.username, passwordHash, email: demo.email, role: 'employee' });
      await Employee.create({ employeeId: employeeIdCounter, userId: userIdCounter, firstName: demo.firstName, lastName: demo.lastName, position: demo.position, hireDate: demo.hireDate, departmentId: 1 });

      for (const type of leaveTypes) {
        balanceIdCounter++;
        await LeaveBalance.create({ balanceId: balanceIdCounter, employeeId: employeeIdCounter, leaveType: type, year: 2026, totalDays: 15, usedDays: Math.floor(Math.random() * 10) });
      }

      attendanceIdCounter++;
      await Attendance.create({ 
        attendanceId: attendanceIdCounter,
        employeeId: employeeIdCounter, 
        date: '2026-10-12', 
        status: 'present', 
        timeIn: '09:00', 
        timeOut: '17:00' 
      });
      
      reviewIdCounter++;
      await PerformanceReview.create({ 
        reviewId: reviewIdCounter,
        employeeId: employeeIdCounter, 
        reviewerId: reviewerId,
        reviewDate: '2026-09-30', 
        rating: Math.floor(Math.random() * 5) + 1, 
        comments: 'Good performance.' 
      });

      console.log(`Created: ${demo.username} (ID: ${employeeIdCounter}) with Attendance & Review data.`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createMoreDemoData();
