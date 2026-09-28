package com.hrms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.hrms.backend.entity.Employee;
import com.hrms.backend.security.AuthenticatedUser;
import com.hrms.backend.services.EmployeeService;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // Returns ONLY the employee record linked to the calling user's JWT.
    // This must be mapped before /{id} so Spring doesn't try to parse "me" as an Integer.
    @GetMapping("/me")
    public ResponseEntity<Employee> getMyEmployee(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(employeeService.getEmployeeByUserId(principal.userId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Integer employeeId) {
        return ResponseEntity.ok(employeeService.getEmployeeById(employeeId));
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee saved = employeeService.createEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Lets logged-in employees update their own profile (contact, address, photo).
    @PutMapping("/me")
    public ResponseEntity<Employee> updateMyProfile(@AuthenticationPrincipal AuthenticatedUser principal,
                                                     @RequestBody Employee updates) {
        Employee existing = employeeService.getEmployeeByUserId(principal.userId());
        // Only allow safe self-edits
        existing.setContactNumber(updates.getContactNumber());
        existing.setAddress(updates.getAddress());
        existing.setProfilePhoto(updates.getProfilePhoto());
        Employee updated = employeeService.updateEmployee(existing.getEmployeeId(), existing);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable("id") Integer employeeId,
                                                     @Valid @RequestBody Employee employee) {
        Employee updated = employeeService.updateEmployee(employeeId, employee);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Integer employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.noContent().build();
    }
}