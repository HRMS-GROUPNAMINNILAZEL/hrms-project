package com.hrms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.PerformanceReview;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Integer> {
    List<PerformanceReview> findByEmployee_EmployeeId(Integer employeeId);
    List<PerformanceReview> findByReviewer_EmployeeId(Integer reviewerId);
}
