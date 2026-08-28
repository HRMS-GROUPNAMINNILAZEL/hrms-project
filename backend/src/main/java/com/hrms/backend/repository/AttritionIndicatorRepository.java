package com.hrms.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.AttritionIndicator;

public interface AttritionIndicatorRepository extends JpaRepository<AttritionIndicator, Integer> {
    List<AttritionIndicator> findByEmployee_EmployeeId(Integer employeeId);
    List<AttritionIndicator> findBySnapshotDate(LocalDate snapshotDate);
    Optional<AttritionIndicator> findByEmployee_EmployeeIdAndSnapshotDate(Integer employeeId, LocalDate snapshotDate);
    List<AttritionIndicator> findBySnapshotDateOrderByRiskScoreDesc(LocalDate snapshotDate);
}
