package com.hrms.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

// Aggregate figures for the admin overview dashboard. Kept as one payload so
// the frontend can render the whole page from a single request.
public class AnalyticsSummary {

    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveEmployees;
    private Map<String, Long> headcountByDepartment;
    private Map<String, Long> employeesByStatus;
    private BigDecimal totalNetPayLastPeriod;
    private long pendingLeaveRequests;
    private Map<String, Long> leaveRequestsByStatus;
    private Map<String, Long> leaveRequestsByType;
    private long highAttritionRiskCount;
    private long mediumAttritionRiskCount;

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long v) { this.totalEmployees = v; }

    public long getActiveEmployees() { return activeEmployees; }
    public void setActiveEmployees(long v) { this.activeEmployees = v; }

    public long getOnLeaveEmployees() { return onLeaveEmployees; }
    public void setOnLeaveEmployees(long v) { this.onLeaveEmployees = v; }

    public Map<String, Long> getHeadcountByDepartment() { return headcountByDepartment; }
    public void setHeadcountByDepartment(Map<String, Long> v) { this.headcountByDepartment = v; }

    public Map<String, Long> getEmployeesByStatus() { return employeesByStatus; }
    public void setEmployeesByStatus(Map<String, Long> v) { this.employeesByStatus = v; }

    public BigDecimal getTotalNetPayLastPeriod() { return totalNetPayLastPeriod; }
    public void setTotalNetPayLastPeriod(BigDecimal v) { this.totalNetPayLastPeriod = v; }

    public long getPendingLeaveRequests() { return pendingLeaveRequests; }
    public void setPendingLeaveRequests(long v) { this.pendingLeaveRequests = v; }

    public Map<String, Long> getLeaveRequestsByStatus() { return leaveRequestsByStatus; }
    public void setLeaveRequestsByStatus(Map<String, Long> v) { this.leaveRequestsByStatus = v; }

    public Map<String, Long> getLeaveRequestsByType() { return leaveRequestsByType; }
    public void setLeaveRequestsByType(Map<String, Long> v) { this.leaveRequestsByType = v; }

    public long getHighAttritionRiskCount() { return highAttritionRiskCount; }
    public void setHighAttritionRiskCount(long v) { this.highAttritionRiskCount = v; }

    public long getMediumAttritionRiskCount() { return mediumAttritionRiskCount; }
    public void setMediumAttritionRiskCount(long v) { this.mediumAttritionRiskCount = v; }
}
