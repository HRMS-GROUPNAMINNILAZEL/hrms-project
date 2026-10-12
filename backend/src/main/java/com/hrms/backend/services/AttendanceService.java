package com.hrms.backend.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.AttendanceRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.security.AuthenticatedUser;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Integer attendanceId) {
        return attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + attendanceId));
    }

    public List<Attendance> getAttendanceByEmployee(Integer employeeId) {
        return attendanceRepository.findByEmployee_EmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<Attendance> getAttendanceByEmployeeAndDateRange(Integer employeeId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByEmployee_EmployeeIdAndDateBetween(employeeId, start, end);
    }

    public Attendance createAttendance(Attendance attendance, AuthenticatedUser principal) {
        if (principal != null && "EMPLOYEE".equalsIgnoreCase(principal.role())) {
            Employee emp = employeeRepository.findByUser_UserId(principal.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("No employee profile found for logged-in user"));
            attendance.setEmployee(emp);
        }
        return createAttendance(attendance);
    }

    public Attendance createAttendance(Attendance attendance) {
        // Prevent duplicate clock-in for the same employee on the same date
        if (attendance.getEmployee() != null && attendance.getDate() != null) {
            attendanceRepository.findByEmployee_EmployeeIdAndDate(
                    attendance.getEmployee().getEmployeeId(), attendance.getDate())
                    .ifPresent(existing -> {
                        throw new IllegalStateException(
                                "Attendance record already exists for this employee on " + attendance.getDate()
                                + ". Use clock-out to update the existing record instead.");
                    });
        }
        return attendanceRepository.save(attendance);
    }

    public Attendance updateAttendance(Integer attendanceId, Attendance updatedAttendance, AuthenticatedUser principal) {
        Attendance existing = getAttendanceById(attendanceId);

        if (principal != null) {
            String role = principal.role();
            boolean isAdminOrHr = "ADMIN".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role);
            if (!isAdminOrHr) {
                if (existing.getEmployee() == null || existing.getEmployee().getUser() == null
                        || !existing.getEmployee().getUser().getUserId().equals(principal.userId())) {
                    throw new AccessDeniedException("You can only update your own attendance record.");
                }
            }
        }

        // Only update non-null fields so clock-out or partial payloads don't overwrite existing values
        if (updatedAttendance.getTimeOut() != null) {
            existing.setTimeOut(updatedAttendance.getTimeOut());
        }
        if (updatedAttendance.getStatus() != null) {
            existing.setStatus(updatedAttendance.getStatus());
        }

        boolean isAdminOrHr = (principal == null) || "ADMIN".equalsIgnoreCase(principal.role()) || "HR".equalsIgnoreCase(principal.role());
        if (isAdminOrHr) {
            if (updatedAttendance.getTimeIn() != null) {
                existing.setTimeIn(updatedAttendance.getTimeIn());
            }
            if (updatedAttendance.getDate() != null) {
                existing.setDate(updatedAttendance.getDate());
            }
            if (updatedAttendance.getEmployee() != null && updatedAttendance.getEmployee().getEmployeeId() != null) {
                if (!updatedAttendance.getEmployee().getEmployeeId().equals(existing.getEmployee().getEmployeeId())) {
                    Employee emp = employeeRepository.findById(updatedAttendance.getEmployee().getEmployeeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + updatedAttendance.getEmployee().getEmployeeId()));
                    existing.setEmployee(emp);
                }
            }
        }

        return attendanceRepository.save(existing);
    }

    public Attendance updateAttendance(Integer attendanceId, Attendance updatedAttendance) {
        return updateAttendance(attendanceId, updatedAttendance, null);
    }

    public void deleteAttendance(Integer attendanceId) {
        Attendance existing = getAttendanceById(attendanceId);
        attendanceRepository.delete(existing);
    }
}
