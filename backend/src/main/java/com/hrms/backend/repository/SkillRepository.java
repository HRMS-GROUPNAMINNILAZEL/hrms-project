package com.hrms.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Skill;

public interface SkillRepository extends JpaRepository<Skill, Integer> {
    Optional<Skill> findBySkillNameIgnoreCase(String skillName);
}
