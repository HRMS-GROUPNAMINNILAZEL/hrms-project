package com.hrms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hrms.backend.entity.AttritionIndicator;
import com.hrms.backend.services.AttritionService;

@RestController
@RequestMapping("/api/attrition")
public class AttritionController {

    @Autowired
    private AttritionService attritionService;

    // ?employeeId= for one employee's history; ?latest=true for the most recent
    // snapshot per employee (what the risk dashboard renders); otherwise every
    // snapshot ever taken.
    @GetMapping
    public ResponseEntity<List<AttritionIndicator>> getIndicators(
            @RequestParam(value = "employeeId", required = false) Integer employeeId,
            @RequestParam(value = "latest", required = false) Boolean latest) {

        if (employeeId != null) {
            return ResponseEntity.ok(attritionService.getByEmployee(employeeId));
        }
        if (Boolean.TRUE.equals(latest)) {
            return ResponseEntity.ok(attritionService.getLatestSnapshot());
        }
        return ResponseEntity.ok(attritionService.getAllIndicators());
    }

    // Recomputes and stores a fresh snapshot for every active employee from
    // their current attendance/leave/review data.
    @PostMapping("/compute")
    public ResponseEntity<List<AttritionIndicator>> computeAll() {
        return ResponseEntity.ok(attritionService.computeForAllActiveEmployees());
    }

    @PostMapping("/compute/{employeeId}")
    public ResponseEntity<AttritionIndicator> computeOne(@PathVariable("employeeId") Integer employeeId) {
        return ResponseEntity.ok(attritionService.computeForEmployee(employeeId));
    }
}
