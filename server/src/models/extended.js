const mongoose = require('mongoose');

const EmployeeSkillSchema = new mongoose.Schema({
  employeeSkillId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  skillId: { type: Number, required: true },
  proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'beginner' },
  acquiredDate: { type: String, default: null }
});

const RoleRequiredSkillSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  position: { type: String, required: true },
  departmentId: { type: Number, default: null },
  skillId: { type: Number, required: true },
  requiredLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' }
});

const LeaveBalanceSchema = new mongoose.Schema({
  balanceId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  leaveType: { type: String, enum: ['sick', 'vacation', 'emergency', 'maternity', 'paternity', 'unpaid'], required: true },
  totalDays: { type: Number, default: 0 },
  usedDays: { type: Number, default: 0 },
  year: { type: Number, required: true }
});

const LeaveRequestSchema = new mongoose.Schema({
  leaveId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  leaveType: { type: String, enum: ['sick', 'vacation', 'emergency', 'maternity', 'paternity', 'unpaid'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Number, default: null },
  requestedAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  notificationId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const PasswordResetTokenSchema = new mongoose.Schema({
  tokenId: { type: Number, unique: true },
  userId: { type: Number, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const PerformanceReviewSchema = new mongoose.Schema({
  reviewId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  reviewerId: { type: Number, required: true },
  reviewPeriod: { type: String, default: null },
  rating: { type: Number, default: null },
  comments: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const AttritionIndicatorSchema = new mongoose.Schema({
  indicatorId: { type: Number, unique: true },
  employeeId: { type: Number, required: true },
  snapshotDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  lateAttendanceCount30d: { type: Number, default: 0 },
  leaveFrequency30d: { type: Number, default: 0 },
  daysSinceLastPromotion: { type: Number, default: null },
  performanceTrend: { type: String, default: 'stable' },
  riskScore: { type: Number, default: 0.00 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  factors: [{ type: String }],
  computedAt: { type: Date, default: Date.now }
});

module.exports = {
  EmployeeSkill: mongoose.model('EmployeeSkill', EmployeeSkillSchema),
  RoleRequiredSkill: mongoose.model('RoleRequiredSkill', RoleRequiredSkillSchema),
  LeaveBalance: mongoose.model('LeaveBalance', LeaveBalanceSchema),
  LeaveRequest: mongoose.model('LeaveRequest', LeaveRequestSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  PasswordResetToken: mongoose.model('PasswordResetToken', PasswordResetTokenSchema),
  PerformanceReview: mongoose.model('PerformanceReview', PerformanceReviewSchema),
  AttritionIndicator: mongoose.model('AttritionIndicator', AttritionIndicatorSchema)
};
