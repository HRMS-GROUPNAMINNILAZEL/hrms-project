package com.hrms.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByEmployee_EmployeeId(Integer employeeId);
    List<Attendance> findByAttendanceDate(LocalDate date);
    List<Attendance> findByEmployee_EmployeeIdAndAttendanceDateBetween(Integer employeeId, LocalDate start, LocalDate end);
}