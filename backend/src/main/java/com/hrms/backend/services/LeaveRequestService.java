package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.entity.User;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.LeaveRequestRepository;
import com.hrms.backend.repository.UserRepository;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest getLeaveRequestById(Integer leaveId) {
        return leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));
    }

    public List<LeaveRequest> getLeaveRequestsByEmployee(Integer employeeId) {
        return leaveRequestRepository.findByEmployee_EmployeeId(employeeId);
    }

    public List<LeaveRequest> getLeaveRequestsByStatus(LeaveRequest.Status status) {
        return leaveRequestRepository.findByStatus(status);
    }

    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        // Fail fast if the employee doesn't have enough remaining balance for this
        // leave type/year, rather than letting them file a request that can never
        // legitimately be approved.
        leaveBalanceService.assertSufficientBalance(
                leaveRequest.getEmployee().getEmployeeId(),
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate());

        leaveRequest.setStatus(LeaveRequest.Status.pending);
        return leaveRequestRepository.save(leaveRequest);
    }

    public LeaveRequest updateLeaveRequest(Integer leaveId, LeaveRequest updatedLeaveRequest) {
        LeaveRequest existing = getLeaveRequestById(leaveId);

        existing.setEmployee(updatedLeaveRequest.getEmployee());
        existing.setLeaveType(updatedLeaveRequest.getLeaveType());
        existing.setStartDate(updatedLeaveRequest.getStartDate());
        existing.setEndDate(updatedLeaveRequest.getEndDate());
        existing.setReason(updatedLeaveRequest.getReason());

        return leaveRequestRepository.save(existing);
    }

    // Looks up the user making the request and confirms they're an admin.
    // Throws if the user doesn't exist or isn't an admin - callers should not
    // catch this, it's meant to propagate up to the GlobalExceptionHandler.
    private User requireAdmin(Integer userId) {
        if (userId == null) {
            throw new AccessDeniedException("Only admins can approve or reject leave requests.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getRole() != User.Role.admin) {
            throw new AccessDeniedException("Only admins can approve or reject leave requests.");
        }
        return user;
    }

    public LeaveRequest approveLeaveRequest(Integer leaveId, Integer approverId) {
        User approver = requireAdmin(approverId);
        LeaveRequest existing = getLeaveRequestById(leaveId);

        // Re-check the balance at approval time too, since it may have shifted
        // (e.g. another leave request for the same employee/type was approved
        // in between the employee filing this one and it reaching an approver).
        if (existing.getStatus() != LeaveRequest.Status.approved) {
            leaveBalanceService.assertSufficientBalance(
                    existing.getEmployee().getEmployeeId(), existing.getLeaveType(), existing.getStartDate(), existing.getEndDate());
            leaveBalanceService.deductForApproval(
                    existing.getEmployee().getEmployeeId(), existing.getLeaveType(), existing.getStartDate(), existing.getEndDate());
        }

        existing.setStatus(LeaveRequest.Status.approved);
        existing.setApprovedBy(approver);
        return leaveRequestRepository.save(existing);
    }

    public LeaveRequest rejectLeaveRequest(Integer leaveId, Integer approverId) {
        User approver = requireAdmin(approverId);
        LeaveRequest existing = getLeaveRequestById(leaveId);

        // If it had already been approved (and is now being reversed), give the
        // days back to the employee's balance.
        if (existing.getStatus() == LeaveRequest.Status.approved) {
            leaveBalanceService.restoreFromApproval(
                    existing.getEmployee().getEmployeeId(), existing.getLeaveType(), existing.getStartDate(), existing.getEndDate());
        }

        existing.setStatus(LeaveRequest.Status.rejected);
        existing.setApprovedBy(approver);
        return leaveRequestRepository.save(existing);
    }

    public void deleteLeaveRequest(Integer leaveId) {
        LeaveRequest existing = getLeaveRequestById(leaveId);

        // Deleting an already-approved request (e.g. HR cleaning up a mistaken
        // entry) should hand the days back rather than leaving them consumed.
        if (existing.getStatus() == LeaveRequest.Status.approved) {
            leaveBalanceService.restoreFromApproval(
                    existing.getEmployee().getEmployeeId(), existing.getLeaveType(), existing.getStartDate(), existing.getEndDate());
        }

        leaveRequestRepository.delete(existing);
    }
}