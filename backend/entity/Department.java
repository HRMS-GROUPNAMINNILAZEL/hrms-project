package com.hrms.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Integer departmentId;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @ManyToOne
    @JoinColumn(name = "department_head_id")
    private Employee departmentHead;

    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Employee getDepartmentHead() { return departmentHead; }
    public void setDepartmentHead(Employee departmentHead) { this.departmentHead = departmentHead; }
}