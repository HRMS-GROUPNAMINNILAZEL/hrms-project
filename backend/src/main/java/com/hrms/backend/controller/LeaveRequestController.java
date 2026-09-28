package com.hrms.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.services.LeaveRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests(
            @RequestParam(value = "employeeId", required = false) Integer employeeId,
            @RequestParam(value = "status", required = false) LeaveRequest.Status status) {

        if (employeeId != null) {
            return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByEmployee(employeeId));
        }
        if (status != null) {
            return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByStatus(status));
        }
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable("id") Integer leaveId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestById(leaveId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequest> createLeaveRequest(@Valid @RequestBody LeaveRequest leaveRequest) {
        LeaveRequest saved = leaveRequestService.createLeaveRequest(leaveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(@PathVariable("id") Integer leaveId,
                                                              @Valid @RequestBody LeaveRequest leaveRequest) {
        LeaveRequest updated = leaveRequestService.updateLeaveRequest(leaveId, leaveRequest);
        return ResponseEntity.ok(updated);
    }

    // Body: { "approverId": 5 } - approverId must belong to a user with role admin, hr, or manager
    @PatchMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(@PathVariable("id") Integer leaveId,
                                                               @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(leaveRequestService.approveLeaveRequest(leaveId, body.get("approverId")));
    }

    // Body: { "approverId": 5 } - approverId must belong to a user with role admin, hr, or manager
    @PatchMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(@PathVariable("id") Integer leaveId,
                                                              @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(leaveRequestService.rejectLeaveRequest(leaveId, body.get("approverId")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable("id") Integer leaveId) {
        leaveRequestService.deleteLeaveRequest(leaveId);
        return ResponseEntity.noContent().build();
    }
}