const mongoose = require('mongoose');
const { Employee, Department, User, LeaveBalance } = require('./src/models');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms_db';

async function syncDepartments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const departments = await Department.find();
    if (departments.length === 0) {
      console.log('No departments found. Please seed the database first.');
      process.exit(1);
    }
    
    // Use the first department as default for unassigned
    const defaultDept = departments[0];
    console.log(`Defaulting unassigned employees to: ${defaultDept.departmentName} (ID: ${defaultDept.departmentId})`);

    const result = await Employee.updateMany(
      { departmentId: null },
      { $set: { departmentId: defaultDept.departmentId } }
    );

    console.log(`Updated ${result.modifiedCount} employees with default department.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

syncDepartments();
