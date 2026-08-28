package com.hrms.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "attrition_indicators")
public class AttritionIndicator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "indicator_id")
    private Integer indicatorId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({ "manager" })
    private Employee employee;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "late_attendance_count_30d", nullable = false)
    private Integer lateAttendanceCount30d = 0;

    @Column(name = "leave_frequency_30d", nullable = false)
    private Integer leaveFrequency30d = 0;

    @Column(name = "days_since_last_promotion")
    private Integer daysSinceLastPromotion;

    @Enumerated(EnumType.STRING)
    @Column(name = "performance_trend")
    private PerformanceTrend performanceTrend;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal riskScore = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel = RiskLevel.low;

    public enum PerformanceTrend {
        declining, stable, improving
    }

    public enum RiskLevel {
        low, medium, high
    }

    public Integer getIndicatorId() { return indicatorId; }
    public void setIndicatorId(Integer indicatorId) { this.indicatorId = indicatorId; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }

    public Integer getLateAttendanceCount30d() { return lateAttendanceCount30d; }
    public void setLateAttendanceCount30d(Integer v) { this.lateAttendanceCount30d = v; }

    public Integer getLeaveFrequency30d() { return leaveFrequency30d; }
    public void setLeaveFrequency30d(Integer v) { this.leaveFrequency30d = v; }

    public Integer getDaysSinceLastPromotion() { return daysSinceLastPromotion; }
    public void setDaysSinceLastPromotion(Integer v) { this.daysSinceLastPromotion = v; }

    public PerformanceTrend getPerformanceTrend() { return performanceTrend; }
    public void setPerformanceTrend(PerformanceTrend v) { this.performanceTrend = v; }

    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }
}
