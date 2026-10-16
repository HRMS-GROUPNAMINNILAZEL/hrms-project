const mongoose = require('mongoose');
const { Employee, User, LeaveBalance } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms_db';

const demoEmployees = [
  {
    username: 'demo_emp1',
    email: 'demo1@example.com',
    firstName: 'Demo',
    lastName: 'EmployeeOne',
    position: 'Junior Developer',
    hireDate: '2026-09-01'
  },
  {
    username: 'demo_emp2',
    email: 'demo2@example.com',
    firstName: 'Demo',
    lastName: 'EmployeeTwo',
    position: 'Sales Associate',
    hireDate: '2026-09-15'
  }
];

const leaveTypes = ['sick', 'vacation', 'emergency'];

async function createDemoEmployees() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the latest IDs
    const latestUser = await User.findOne().sort({ userId: -1 });
    const latestEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const latestBalance = await LeaveBalance.findOne().sort({ balanceId: -1 });

    let userIdCounter = latestUser ? latestUser.userId : 0;
    let employeeIdCounter = latestEmployee ? latestEmployee.employeeId : 0;
    let balanceIdCounter = latestBalance ? latestBalance.balanceId : 0;

    for (const demo of demoEmployees) {
      // Check if user exists
      const existingUser = await User.findOne({ username: demo.username });
      if (existingUser) {
        console.log(`User ${demo.username} already exists, skipping.`);
        continue;
      }

      userIdCounter++;
      employeeIdCounter++;
      
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await User.create({
        userId: userIdCounter,
        username: demo.username,
        passwordHash,
        email: demo.email,
        role: 'employee'
      });

      await Employee.create({
        employeeId: employeeIdCounter,
        userId: userIdCounter,
        firstName: demo.firstName,
        lastName: demo.lastName,
        position: demo.position,
        hireDate: demo.hireDate,
        departmentId: 1
      });

      // Create LeaveBalances
      for (const type of leaveTypes) {
        balanceIdCounter++;
        await LeaveBalance.create({
          balanceId: balanceIdCounter,
          employeeId: employeeIdCounter,
          leaveType: type,
          year: 2026,
          totalDays: 15,
          usedDays: 0
        });
      }

      console.log(`Created demo user: ${demo.username} (User ID: ${userIdCounter}, Employee ID: ${employeeIdCounter})`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createDemoEmployees();
