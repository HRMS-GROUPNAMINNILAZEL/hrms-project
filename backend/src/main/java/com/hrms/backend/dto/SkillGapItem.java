package com.hrms.backend.dto;

import com.hrms.backend.entity.EmployeeSkill;
import com.hrms.backend.entity.Skill;

// One row of a skill-gap report: a required skill for the employee's role,
// how proficient they're expected to be, and how they actually measure up.
public class SkillGapItem {

    private Skill skill;
    private EmployeeSkill.ProficiencyLevel requiredLevel;
    private EmployeeSkill.ProficiencyLevel currentLevel; // null if the employee doesn't have this skill at all
    private String status; // "met" | "below" | "missing"

    public SkillGapItem() {}

    public SkillGapItem(Skill skill, EmployeeSkill.ProficiencyLevel requiredLevel,
                         EmployeeSkill.ProficiencyLevel currentLevel, String status) {
        this.skill = skill;
        this.requiredLevel = requiredLevel;
        this.currentLevel = currentLevel;
        this.status = status;
    }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public EmployeeSkill.ProficiencyLevel getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(EmployeeSkill.ProficiencyLevel requiredLevel) { this.requiredLevel = requiredLevel; }

    public EmployeeSkill.ProficiencyLevel getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(EmployeeSkill.ProficiencyLevel currentLevel) { this.currentLevel = currentLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
