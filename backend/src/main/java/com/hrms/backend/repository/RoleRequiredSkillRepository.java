package com.hrms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.RoleRequiredSkill;

public interface RoleRequiredSkillRepository extends JpaRepository<RoleRequiredSkill, Integer> {
    List<RoleRequiredSkill> findByPositionIgnoreCase(String position);
    List<RoleRequiredSkill> findByPositionIgnoreCaseAndDepartment_DepartmentId(String position, Integer departmentId);
}
