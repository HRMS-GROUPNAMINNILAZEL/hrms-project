const { LeaveRequest } = require('./src/models');
const mongoose = require('mongoose');

async function fixLeaveIds() {
  await mongoose.connect('mongodb://localhost:27017/hrms'); // Assuming default
  const requests = await LeaveRequest.find({ leaveId: { $exists: false } });
  
  let lastLeave = await LeaveRequest.findOne({ leaveId: { $exists: true } }).sort({ leaveId: -1 });
  let nextId = lastLeave ? lastLeave.leaveId + 1 : 1;
  
  for (const req of requests) {
    req.leaveId = nextId++;
    await req.save();
    console.log(`Updated LeaveRequest with ID: ${req.leaveId}`);
  }
  
  console.log('Finished updating leave requests.');
  process.exit();
}

fixLeaveIds();
