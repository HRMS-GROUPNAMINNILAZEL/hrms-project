package com.hrms.backend.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.AttritionIndicator;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.entity.PerformanceReview;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.AttendanceRepository;
import com.hrms.backend.repository.AttritionIndicatorRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.LeaveRequestRepository;
import com.hrms.backend.repository.PerformanceReviewRepository;

/**
 * Turns raw attendance / leave / review history into a per-employee flight-risk
 * snapshot. This is a transparent heuristic (not a trained model) - weights are
 * intentionally simple and documented inline so HR can see exactly why a score
 * came out the way it did, rather than treating it as a black box.
 */
@Service
public class AttritionService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private AttritionIndicatorRepository attritionIndicatorRepository;

    public List<AttritionIndicator> getAllIndicators() {
        return attritionIndicatorRepository.findAll();
    }

    public AttritionIndicator getIndicatorById(Integer id) {
        return attritionIndicatorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attrition indicator not found with id: " + id));
    }

    public List<AttritionIndicator> getByEmployee(Integer employeeId) {
        return attritionIndicatorRepository.findByEmployee_EmployeeId(employeeId);
    }

    /** Latest snapshot for every employee that has one, sorted highest risk first. */
    public List<AttritionIndicator> getLatestSnapshot() {
        return attritionIndicatorRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(i -> i.getEmployee().getEmployeeId()))
                .values().stream()
                .map(list -> list.stream().max(Comparator.comparing(AttritionIndicator::getSnapshotDate)).orElseThrow())
                .sorted(Comparator.comparing(AttritionIndicator::getRiskScore).reversed())
                .toList();
    }

    /** Recomputes and stores today's snapshot for every active employee. */
    public List<AttritionIndicator> computeForAllActiveEmployees() {
        List<Employee> employees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == Employee.Status.active)
                .toList();

        return employees.stream().map(e -> computeForEmployee(e.getEmployeeId())).toList();
    }

    public AttritionIndicator computeForEmployee(Integer employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();
        LocalDate windowStart = today.minusDays(30);

        List<Attendance> recentAttendance = attendanceRepository.findByEmployee_EmployeeIdAndDateBetween(employeeId, windowStart, today);
        long lateCount = recentAttendance.stream().filter(a -> a.getStatus() == Attendance.Status.late).count();

        List<LeaveRequest> allLeaveRequests = leaveRequestRepository.findByEmployee_EmployeeId(employeeId);
        long leaveFrequency = allLeaveRequests.stream()
                .filter(lr -> lr.getRequestedAt() != null && !lr.getRequestedAt().toLocalDate().isBefore(windowStart))
                .count();

        List<PerformanceReview> reviews = performanceReviewRepository.findByEmployee_EmployeeId(employeeId).stream()
                .filter(r -> r.getCreatedAt() != null)
                .sorted(Comparator.comparing(PerformanceReview::getCreatedAt))
                .toList();

        AttritionIndicator.PerformanceTrend trend = null;
        if (reviews.size() >= 2) {
            BigDecimal previous = reviews.get(reviews.size() - 2).getRating();
            BigDecimal latest = reviews.get(reviews.size() - 1).getRating();
            if (previous != null && latest != null) {
                int cmp = latest.compareTo(previous);
                trend = cmp > 0 ? AttritionIndicator.PerformanceTrend.improving
                        : cmp < 0 ? AttritionIndicator.PerformanceTrend.declining
                        : AttritionIndicator.PerformanceTrend.stable;
            }
        }

        // Weighted heuristic, capped at 100:
        //  - each late day in the last 30:      +8
        //  - each leave request filed in 30d:    +5
        //  - declining performance trend:       +15
        //  - stable trend:                       +0
        //  - improving trend:                    -10 (floor at 0)
        int score = (int) (lateCount * 8 + leaveFrequency * 5);
        if (trend == AttritionIndicator.PerformanceTrend.declining) score += 15;
        if (trend == AttritionIndicator.PerformanceTrend.improving) score -= 10;
        score = Math.max(0, Math.min(100, score));

        AttritionIndicator.RiskLevel level = score >= 60 ? AttritionIndicator.RiskLevel.high
                : score >= 30 ? AttritionIndicator.RiskLevel.medium
                : AttritionIndicator.RiskLevel.low;

        AttritionIndicator indicator = attritionIndicatorRepository
                .findByEmployee_EmployeeIdAndSnapshotDate(employeeId, today)
                .orElseGet(AttritionIndicator::new);

        indicator.setEmployee(employee);
        indicator.setSnapshotDate(today);
        indicator.setLateAttendanceCount30d((int) lateCount);
        indicator.setLeaveFrequency30d((int) leaveFrequency);
        // Promotion history isn't tracked anywhere in this system yet, so this
        // stays null rather than being estimated from an unrelated field.
        indicator.setDaysSinceLastPromotion(null);
        indicator.setPerformanceTrend(trend);
        indicator.setRiskScore(new BigDecimal(score).setScale(2, RoundingMode.HALF_UP));
        indicator.setRiskLevel(level);

        return attritionIndicatorRepository.save(indicator);
    }
}
