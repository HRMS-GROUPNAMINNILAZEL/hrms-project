package com.hrms.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
}