package com.hrms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hrms.backend.entity.RoleRequiredSkill;
import com.hrms.backend.services.RoleRequiredSkillService;

@RestController
@RequestMapping("/api/role-required-skills")
public class RoleRequiredSkillController {

    @Autowired
    private RoleRequiredSkillService roleRequiredSkillService;

    @GetMapping
    public ResponseEntity<List<RoleRequiredSkill>> getAll() {
        return ResponseEntity.ok(roleRequiredSkillService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleRequiredSkill> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(roleRequiredSkillService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RoleRequiredSkill> create(@RequestBody RoleRequiredSkill entity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleRequiredSkillService.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleRequiredSkill> update(@PathVariable("id") Integer id, @RequestBody RoleRequiredSkill entity) {
        return ResponseEntity.ok(roleRequiredSkillService.update(id, entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        roleRequiredSkillService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
