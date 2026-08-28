package com.hrms.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.entity.LeaveBalance;
import com.hrms.backend.services.LeaveBalanceService;

@RestController
@RequestMapping("/api/leave-balances")
public class LeaveBalanceController {

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    // ?employeeId=&year= (year defaults to the current year and also seeds any
    // missing leave-type rows, so the frontend always gets a full set of 6).
    @GetMapping
    public ResponseEntity<List<LeaveBalance>> getLeaveBalances(
            @RequestParam(value = "employeeId", required = false) Integer employeeId,
            @RequestParam(value = "year", required = false) Integer year) {

        if (employeeId != null) {
            int resolvedYear = year != null ? year : LocalDate.now().getYear();
            return ResponseEntity.ok(leaveBalanceService.ensureBalancesForYear(employeeId, resolvedYear));
        }
        return ResponseEntity.ok(leaveBalanceService.getAllLeaveBalances());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveBalance> getLeaveBalanceById(@PathVariable("id") Integer balanceId) {
        return ResponseEntity.ok(leaveBalanceService.getLeaveBalanceById(balanceId));
    }

    @PostMapping
    public ResponseEntity<LeaveBalance> createLeaveBalance(@RequestBody LeaveBalance leaveBalance) {
        LeaveBalance saved = leaveBalanceService.createLeaveBalance(leaveBalance);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveBalance> updateLeaveBalance(@PathVariable("id") Integer balanceId,
                                                             @RequestBody LeaveBalance leaveBalance) {
        return ResponseEntity.ok(leaveBalanceService.updateLeaveBalance(balanceId, leaveBalance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveBalance(@PathVariable("id") Integer balanceId) {
        leaveBalanceService.deleteLeaveBalance(balanceId);
        return ResponseEntity.noContent().build();
    }
}
