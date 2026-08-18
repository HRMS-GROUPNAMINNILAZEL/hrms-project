package com.hrms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Payroll;

public interface PayrollRepository extends JpaRepository<Payroll, Integer> {
    List<Payroll> findByEmployee_EmployeeId(Integer employeeId);
}