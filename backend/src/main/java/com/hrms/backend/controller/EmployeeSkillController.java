package com.hrms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hrms.backend.dto.SkillGapItem;
import com.hrms.backend.entity.EmployeeSkill;
import com.hrms.backend.services.EmployeeSkillService;

@RestController
@RequestMapping("/api/employee-skills")
public class EmployeeSkillController {

    @Autowired
    private EmployeeSkillService employeeSkillService;

    @GetMapping
    public ResponseEntity<List<EmployeeSkill>> getAll(
            @RequestParam(value = "employeeId", required = false) Integer employeeId) {
        if (employeeId != null) {
            return ResponseEntity.ok(employeeSkillService.getByEmployee(employeeId));
        }
        return ResponseEntity.ok(employeeSkillService.getAllEmployeeSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSkill> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(employeeSkillService.getEmployeeSkillById(id));
    }

    // Skill-gap report for one employee: every skill required by their role,
    // whether they have it, and at what level vs. what's required.
    @GetMapping("/gap-analysis/{employeeId}")
    public ResponseEntity<List<SkillGapItem>> getSkillGap(@PathVariable("employeeId") Integer employeeId) {
        return ResponseEntity.ok(employeeSkillService.getSkillGap(employeeId));
    }

    @PostMapping
    public ResponseEntity<EmployeeSkill> create(@RequestBody EmployeeSkill employeeSkill) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeSkillService.createEmployeeSkill(employeeSkill));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeSkill> update(@PathVariable("id") Integer id, @RequestBody EmployeeSkill employeeSkill) {
        return ResponseEntity.ok(employeeSkillService.updateEmployeeSkill(id, employeeSkill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        employeeSkillService.deleteEmployeeSkill(id);
        return ResponseEntity.noContent().build();
    }
}
