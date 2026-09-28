package com.hrms.backend.services;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.AnalyticsSummary;
import com.hrms.backend.entity.AttritionIndicator;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveRequest;
import com.hrms.backend.repository.AttritionIndicatorRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.LeaveRequestRepository;

@Service
public class AnalyticsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AttritionIndicatorRepository attritionIndicatorRepository;

    public AnalyticsSummary getSummary() {
        List<Employee> employees = employeeRepository.findAll();
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll();

        AnalyticsSummary summary = new AnalyticsSummary();

        summary.setTotalEmployees(employees.size());
        summary.setActiveEmployees(employees.stream().filter(e -> e.getStatus() == Employee.Status.active).count());
        summary.setOnLeaveEmployees(employees.stream().filter(e -> e.getStatus() == Employee.Status.on_leave).count());

        summary.setHeadcountByDepartment(employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getDepartmentName(), Collectors.counting())));

        summary.setEmployeesByStatus(employees.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting())));

        summary.setPendingLeaveRequests(leaveRequests.stream()
                .filter(lr -> lr.getStatus() == LeaveRequest.Status.pending).count());

        summary.setLeaveRequestsByStatus(leaveRequests.stream()
                .collect(Collectors.groupingBy(lr -> lr.getStatus().name(), Collectors.counting())));

        summary.setLeaveRequestsByType(leaveRequests.stream()
                .collect(Collectors.groupingBy(lr -> lr.getLeaveType().name(), Collectors.counting())));

        List<AttritionIndicator> latestSnapshots = attritionIndicatorRepository.findAll().stream()
                .collect(Collectors.groupingBy(i -> i.getEmployee().getEmployeeId()))
                .values().stream()
                .map(list -> list.stream().max(Comparator.comparing(AttritionIndicator::getSnapshotDate)).orElseThrow())
                .toList();

        summary.setHighAttritionRiskCount(latestSnapshots.stream()
                .filter(i -> i.getRiskLevel() == AttritionIndicator.RiskLevel.high).count());
        summary.setMediumAttritionRiskCount(latestSnapshots.stream()
                .filter(i -> i.getRiskLevel() == AttritionIndicator.RiskLevel.medium).count());

        return summary;
    }
}
