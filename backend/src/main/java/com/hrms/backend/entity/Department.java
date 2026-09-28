package com.hrms.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Integer departmentId;

    @NotBlank(message = "Department name is required")
    @Size(max = 100, message = "Department name must be at most 100 characters")
    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    // Employee <-> Department is a two-way relationship (an Employee belongs to a
    // Department, and a Department can have an Employee as its head). Without this
    // annotation, serializing a Department whose head belongs to that same
    // department (or a chain that loops back) causes Jackson to recurse forever:
    // Department -> departmentHead -> department -> departmentHead -> ...
    // which crashes the request with a 500. Ignoring these two properties on the
    // nested employee stops the walk from going back into Department/Employee again.
    @ManyToOne
    @JoinColumn(name = "department_head_id")
    @JsonIgnoreProperties({ "department", "manager" })
    private Employee departmentHead;

    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Employee getDepartmentHead() { return departmentHead; }
    public void setDepartmentHead(Employee departmentHead) { this.departmentHead = departmentHead; }
}