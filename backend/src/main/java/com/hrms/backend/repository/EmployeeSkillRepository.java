package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.EmployeeSkill;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Integer> {
    List<EmployeeSkill> findByEmployee_EmployeeId(Integer employeeId);
    Optional<EmployeeSkill> findByEmployee_EmployeeIdAndSkill_SkillId(Integer employeeId, Integer skillId);
}
