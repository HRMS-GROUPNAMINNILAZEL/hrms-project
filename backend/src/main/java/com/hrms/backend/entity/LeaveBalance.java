package com.hrms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "balance_id")
    private Integer balanceId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Reuses the same leave_type enum values as LeaveRequest so a balance row
    // can be matched 1:1 against the leave type on a request.
    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false)
    private LeaveRequest.LeaveType leaveType;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays = 0;

    @Column(name = "used_days", nullable = false)
    private Integer usedDays = 0;

    @Column(nullable = false)
    private Integer year;

    public Integer getBalanceId() { return balanceId; }
    public void setBalanceId(Integer balanceId) { this.balanceId = balanceId; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LeaveRequest.LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveRequest.LeaveType leaveType) { this.leaveType = leaveType; }

    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }

    public Integer getUsedDays() { return usedDays; }
    public void setUsedDays(Integer usedDays) { this.usedDays = usedDays; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    // Not persisted - convenience for the frontend so it doesn't have to
    // recompute this on every render.
    @jakarta.persistence.Transient
    public Integer getRemainingDays() {
        if (totalDays == null || usedDays == null) return null;
        return totalDays - usedDays;
    }
}
