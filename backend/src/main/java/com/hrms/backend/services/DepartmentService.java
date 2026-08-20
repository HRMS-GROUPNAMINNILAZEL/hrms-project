package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Department;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.DepartmentRepository;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Integer departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Integer departmentId, Department updatedDepartment) {
        Department existing = getDepartmentById(departmentId);

        existing.setDepartmentName(updatedDepartment.getDepartmentName());
        existing.setDepartmentHead(updatedDepartment.getDepartmentHead());

        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Integer departmentId) {
        Department existing = getDepartmentById(departmentId);
        departmentRepository.delete(existing);
    }
}
