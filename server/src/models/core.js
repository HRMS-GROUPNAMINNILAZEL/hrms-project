const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'hr', 'manager', 'employee'], default: 'employee' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: Number, unique: true },
  userId: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  departmentId: { type: Number, default: null },
  position: { type: String, default: null },
  managerId: { type: Number, default: null },
  hireDate: { type: String, required: true },
  status: { type: String, enum: ['active', 'resigned', 'terminated', 'on_leave'], default: 'active' },
  contactNumber: { type: String, default: null },
  address: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  profilePhoto: { type: String, default: null }
});

const DepartmentSchema = new mongoose.Schema({
  departmentId: { type: Number, unique: true },
  departmentName: { type: String, required: true },
  departmentHeadId: { type: Number, default: null }
});

const AttendanceSchema = new mongoose.Schema({
  attendanceId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  date: { type: String, required: true },
  timeIn: { type: String, default: null },
  timeOut: { type: String, default: null },
  status: { type: String, enum: ['present', 'late', 'absent', 'on_leave'], default: 'present' }
});

const SkillSchema = new mongoose.Schema({
  skillId: { type: Number, unique: true },
  skillName: { type: String, required: true, unique: true },
  category: { type: String, enum: ['technical', 'soft', 'certification'], default: 'technical' }
});

const getNextSequence = async (name) => {
  const modelMap = {
    departmentId: { modelName: 'Department', field: 'departmentId' },
    employeeId: { modelName: 'Employee', field: 'employeeId' },
    userId: { modelName: 'User', field: 'userId' },
    attendanceId: { modelName: 'Attendance', field: 'attendanceId' },
    leaveRequestId: { modelName: 'LeaveRequest', field: 'leaveId' },
    leaveId: { modelName: 'LeaveRequest', field: 'leaveId' },
    skillId: { modelName: 'Skill', field: 'skillId' },
    employeeSkillId: { modelName: 'EmployeeSkill', field: 'employeeSkillId' },
    roleRequiredSkillId: { modelName: 'RoleRequiredSkill', field: 'id' },
    id: { modelName: 'RoleRequiredSkill', field: 'id' },
    balanceId: { modelName: 'LeaveBalance', field: 'balanceId' },
    leaveBalanceId: { modelName: 'LeaveBalance', field: 'balanceId' },
    reviewId: { modelName: 'PerformanceReview', field: 'reviewId' },
    performanceReviewId: { modelName: 'PerformanceReview', field: 'reviewId' },
    attritionIndicatorId: { modelName: 'AttritionIndicator', field: 'indicatorId' },
    indicatorId: { modelName: 'AttritionIndicator', field: 'indicatorId' },
    notificationId: { modelName: 'Notification', field: 'notificationId' },
    tokenId: { modelName: 'PasswordResetToken', field: 'tokenId' }
  };

  let maxId = 0;
  const cfg = modelMap[name];
  if (cfg) {
    const Model = mongoose.models[cfg.modelName];
    if (Model) {
      const highest = await Model.findOne({}, {}, { sort: { [cfg.field]: -1 } });
      if (highest && highest[cfg.field] !== undefined && highest[cfg.field] !== null) {
        maxId = Number(highest[cfg.field]) || 0;
      }
    }
  }

  const counter = await Counter.findById(name);
  const currentSeq = counter ? counter.seq : 0;
  const nextVal = Math.max(currentSeq, maxId) + 1;

  const updated = await Counter.findByIdAndUpdate(
    { _id: name },
    { $set: { seq: nextVal } },
    { new: true, upsert: true }
  );
  return updated.seq;
};

module.exports = {
  Counter,
  getNextSequence,
  User: mongoose.model('User', UserSchema),
  Employee: mongoose.model('Employee', EmployeeSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  Attendance: mongoose.model('Attendance', AttendanceSchema),
  Skill: mongoose.model('Skill', SkillSchema)
};
