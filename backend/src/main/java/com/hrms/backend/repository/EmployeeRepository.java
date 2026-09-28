package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByDepartment_DepartmentId(Integer departmentId);
    List<Employee> findByManager_EmployeeId(Integer managerId);
    Optional<Employee> findByUser_UserId(Integer userId);
}
