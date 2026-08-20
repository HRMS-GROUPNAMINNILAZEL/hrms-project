package com.hrms.backend.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Attendance;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

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

    public Attendance createAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public Attendance updateAttendance(Integer attendanceId, Attendance updatedAttendance) {
        Attendance existing = getAttendanceById(attendanceId);

        existing.setEmployee(updatedAttendance.getEmployee());
        existing.setDate(updatedAttendance.getDate());
        existing.setTimeIn(updatedAttendance.getTimeIn());
        existing.setTimeOut(updatedAttendance.getTimeOut());
        existing.setStatus(updatedAttendance.getStatus());

        return attendanceRepository.save(existing);
    }

    public void deleteAttendance(Integer attendanceId) {
        Attendance existing = getAttendanceById(attendanceId);
        attendanceRepository.delete(existing);
    }
}
