package com.hrms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.LeaveRequest;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {
    List<LeaveRequest> findByEmployee_EmployeeId(Integer employeeId);
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);
}