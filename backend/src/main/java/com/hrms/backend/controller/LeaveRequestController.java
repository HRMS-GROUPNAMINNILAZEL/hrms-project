package com.hrms.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.hrms.backend.security.AuthenticatedUser;
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
    public ResponseEntity<LeaveRequest> createLeaveRequest(@Valid @RequestBody LeaveRequest leaveRequest,
                                                           @AuthenticationPrincipal com.hrms.backend.security.AuthenticatedUser principal) {
        LeaveRequest saved = leaveRequestService.createLeaveRequest(leaveRequest, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(@PathVariable("id") Integer leaveId,
                                                              @Valid @RequestBody LeaveRequest leaveRequest) {
        LeaveRequest updated = leaveRequestService.updateLeaveRequest(leaveId, leaveRequest);
        return ResponseEntity.ok(updated);
    }

    // Body: { "approverId": 5 } - approverId must belong to a user with role admin, hr, or manager
    // Body: { "approverId": 5 } - approverId can be supplied or determined from JWT principal
    @PatchMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(@PathVariable("id") Integer leaveId,
                                                            @RequestBody(required = false) Map<String, Integer> body,
                                                            @AuthenticationPrincipal AuthenticatedUser principal) {
        Integer approverId = (principal != null) ? principal.userId() : (body != null ? body.get("approverId") : null);
        return ResponseEntity.ok(leaveRequestService.approveLeaveRequest(leaveId, approverId));
    }

    // Body: { "approverId": 5, "reason": "optional rejection message shown to employee" }
    @PatchMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(@PathVariable("id") Integer leaveId,
                                                           @RequestBody(required = false) Map<String, Object> body,
                                                           @AuthenticationPrincipal AuthenticatedUser principal) {
        Integer approverId = (principal != null) ? principal.userId() : null;
        String reason = null;
        if (body != null) {
            if (approverId == null && body.get("approverId") instanceof Number) {
                approverId = ((Number) body.get("approverId")).intValue();
            }
            Object r = body.get("reason");
            if (r != null && !r.toString().isBlank()) {
                reason = r.toString().trim();
            }
        }
        return ResponseEntity.ok(leaveRequestService.rejectLeaveRequest(leaveId, approverId, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable("id") Integer leaveId,
                                                   @AuthenticationPrincipal AuthenticatedUser principal) {
        leaveRequestService.deleteLeaveRequest(leaveId, principal);
        return ResponseEntity.noContent().build();
    }
}