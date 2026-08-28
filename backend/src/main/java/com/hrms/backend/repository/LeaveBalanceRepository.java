package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.LeaveBalance;
import com.hrms.backend.entity.LeaveRequest;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Integer> {
    List<LeaveBalance> findByEmployee_EmployeeId(Integer employeeId);
    List<LeaveBalance> findByEmployee_EmployeeIdAndYear(Integer employeeId, Integer year);
    Optional<LeaveBalance> findByEmployee_EmployeeIdAndLeaveTypeAndYear(Integer employeeId, LeaveRequest.LeaveType leaveType, Integer year);
}
