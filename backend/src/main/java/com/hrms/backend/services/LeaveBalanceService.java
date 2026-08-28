package com.hrms.backend.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveBalance;
import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.LeaveBalanceRepository;
import com.hrms.backend.repository.EmployeeRepository;

@Service
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // Standard yearly allotments (in days) used the first time a balance row is
    // needed for an employee/leave type/year. HR can edit the totals afterward
    // via updateLeaveBalance - these are just sensible starting points.
    private static final Map<LeaveRequest.LeaveType, Integer> DEFAULT_ALLOTMENTS = new EnumMap<>(LeaveRequest.LeaveType.class);
    static {
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.vacation, 15);
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.sick, 15);
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.emergency, 5);
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.maternity, 105);
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.paternity, 7);
        DEFAULT_ALLOTMENTS.put(LeaveRequest.LeaveType.unpaid, 0);
    }

    public List<LeaveBalance> getAllLeaveBalances() {
        return leaveBalanceRepository.findAll();
    }

    public LeaveBalance getLeaveBalanceById(Integer balanceId) {
        return leaveBalanceRepository.findById(balanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave balance not found with id: " + balanceId));
    }

    public List<LeaveBalance> getByEmployee(Integer employeeId) {
        return leaveBalanceRepository.findByEmployee_EmployeeId(employeeId);
    }

    public List<LeaveBalance> getByEmployeeAndYear(Integer employeeId, Integer year) {
        return leaveBalanceRepository.findByEmployee_EmployeeIdAndYear(employeeId, year);
    }

    // Ensures every leave type has a balance row for this employee/year so the
    // frontend always has something to render, seeding it with the default
    // allotment the first time it's needed.
    public List<LeaveBalance> ensureBalancesForYear(Integer employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        for (LeaveRequest.LeaveType type : LeaveRequest.LeaveType.values()) {
            leaveBalanceRepository.findByEmployee_EmployeeIdAndLeaveTypeAndYear(employeeId, type, year)
                    .orElseGet(() -> {
                        LeaveBalance balance = new LeaveBalance();
                        balance.setEmployee(employee);
                        balance.setLeaveType(type);
                        balance.setYear(year);
                        balance.setTotalDays(DEFAULT_ALLOTMENTS.getOrDefault(type, 0));
                        balance.setUsedDays(0);
                        return leaveBalanceRepository.save(balance);
                    });
        }
        return leaveBalanceRepository.findByEmployee_EmployeeIdAndYear(employeeId, year);
    }

    public LeaveBalance createLeaveBalance(LeaveBalance leaveBalance) {
        if (leaveBalance.getTotalDays() == null) leaveBalance.setTotalDays(0);
        if (leaveBalance.getUsedDays() == null) leaveBalance.setUsedDays(0);
        return leaveBalanceRepository.save(leaveBalance);
    }

    public LeaveBalance updateLeaveBalance(Integer balanceId, LeaveBalance updated) {
        LeaveBalance existing = getLeaveBalanceById(balanceId);
        existing.setTotalDays(updated.getTotalDays());
        if (updated.getUsedDays() != null) {
            existing.setUsedDays(updated.getUsedDays());
        }
        return leaveBalanceRepository.save(existing);
    }

    public void deleteLeaveBalance(Integer balanceId) {
        LeaveBalance existing = getLeaveBalanceById(balanceId);
        leaveBalanceRepository.delete(existing);
    }

    // Inclusive day count between start and end - matches how the leave
    // request modal presents the range to the employee.
    public static long countDays(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end) + 1;
    }

    /**
     * Throws IllegalStateException if the employee doesn't have enough remaining
     * balance to cover the requested range. Unpaid leave is exempt since it isn't
     * capped by an allotment.
     */
    public void assertSufficientBalance(Integer employeeId, LeaveRequest.LeaveType leaveType, LocalDate start, LocalDate end) {
        if (leaveType == LeaveRequest.LeaveType.unpaid) {
            return;
        }
        int year = start.getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, year)
                .orElseGet(() -> ensureBalancesForYear(employeeId, year).stream()
                        .filter(b -> b.getLeaveType() == leaveType)
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("Unable to determine leave balance for this employee.")));

        long requestedDays = countDays(start, end);
        int remaining = balance.getTotalDays() - balance.getUsedDays();
        if (requestedDays > remaining) {
            throw new IllegalStateException(
                    "This request needs " + requestedDays + " " + leaveType + " day(s), but only " + remaining + " remain for " + year + ".");
        }
    }

    /** Called when a leave request moves to "approved" - consumes the days from the balance. */
    public void deductForApproval(Integer employeeId, LeaveRequest.LeaveType leaveType, LocalDate start, LocalDate end) {
        if (leaveType == LeaveRequest.LeaveType.unpaid) {
            return;
        }
        int year = start.getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, year)
                .orElseGet(() -> ensureBalancesForYear(employeeId, year).stream()
                        .filter(b -> b.getLeaveType() == leaveType)
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("Unable to determine leave balance for this employee.")));

        balance.setUsedDays(balance.getUsedDays() + (int) countDays(start, end));
        leaveBalanceRepository.save(balance);
    }

    /** Called when a previously-approved request is deleted or reversed - gives the days back. */
    public void restoreFromApproval(Integer employeeId, LeaveRequest.LeaveType leaveType, LocalDate start, LocalDate end) {
        if (leaveType == LeaveRequest.LeaveType.unpaid) {
            return;
        }
        int year = start.getYear();
        leaveBalanceRepository.findByEmployee_EmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, year)
                .ifPresent(balance -> {
                    int restored = balance.getUsedDays() - (int) countDays(start, end);
                    balance.setUsedDays(Math.max(restored, 0));
                    leaveBalanceRepository.save(balance);
                });
    }
}
