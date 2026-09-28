package com.hrms.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.backend.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByEmployee_EmployeeId(Integer employeeId);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByEmployee_EmployeeIdAndDateBetween(Integer employeeId, LocalDate start, LocalDate end);
    Optional<Attendance> findByEmployee_EmployeeIdAndDate(Integer employeeId, LocalDate date);
}