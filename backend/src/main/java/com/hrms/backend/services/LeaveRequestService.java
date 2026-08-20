package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.LeaveRequestRepository;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

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

    public LeaveRequest approveLeaveRequest(Integer leaveId, Employee approver) {
        LeaveRequest existing = getLeaveRequestById(leaveId);
        existing.setStatus(LeaveRequest.Status.approved);
        existing.setApprovedBy(approver);
        return leaveRequestRepository.save(existing);
    }

    public LeaveRequest rejectLeaveRequest(Integer leaveId, Employee approver) {
        LeaveRequest existing = getLeaveRequestById(leaveId);
        existing.setStatus(LeaveRequest.Status.rejected);
        existing.setApprovedBy(approver);
        return leaveRequestRepository.save(existing);
    }

    public void deleteLeaveRequest(Integer leaveId) {
        LeaveRequest existing = getLeaveRequestById(leaveId);
        leaveRequestRepository.delete(existing);
    }
}
