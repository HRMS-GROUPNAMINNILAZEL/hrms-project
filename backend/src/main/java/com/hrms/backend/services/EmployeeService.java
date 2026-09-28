package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Employee;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Integer employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
    }

    // Used by the /employees/me endpoint so employees only fetch their own record
    // instead of downloading the entire employee list.
    public Employee getEmployeeByUserId(Integer userId) {
        return employeeRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee profile is linked to user id: " + userId));
    }

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Integer employeeId, Employee updatedEmployee) {
        Employee existing = getEmployeeById(employeeId);

        existing.setFirstName(updatedEmployee.getFirstName());
        existing.setLastName(updatedEmployee.getLastName());
        existing.setDepartment(updatedEmployee.getDepartment());
        existing.setPosition(updatedEmployee.getPosition());
        existing.setManager(updatedEmployee.getManager());
        existing.setHireDate(updatedEmployee.getHireDate());
        existing.setStatus(updatedEmployee.getStatus());
        existing.setContactNumber(updatedEmployee.getContactNumber());
        existing.setAddress(updatedEmployee.getAddress());

        return employeeRepository.save(existing);
    }

    public void deleteEmployee(Integer employeeId) {
        Employee existing = getEmployeeById(employeeId);
        employeeRepository.delete(existing);
    }
}