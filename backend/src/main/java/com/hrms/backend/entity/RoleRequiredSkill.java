package com.hrms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "role_required_skills")
public class RoleRequiredSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Matched against Employee.position (free-text position field), optionally
    // scoped to a department when the same job title exists in more than one.
    @Column(nullable = false, length = 100)
    private String position;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level", nullable = false)
    private EmployeeSkill.ProficiencyLevel requiredLevel = EmployeeSkill.ProficiencyLevel.intermediate;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public EmployeeSkill.ProficiencyLevel getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(EmployeeSkill.ProficiencyLevel requiredLevel) { this.requiredLevel = requiredLevel; }
}
