package com.hrms.backend.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.SkillGapItem;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.EmployeeSkill;
import com.hrms.backend.entity.RoleRequiredSkill;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.EmployeeSkillRepository;
import com.hrms.backend.repository.RoleRequiredSkillRepository;

@Service
public class EmployeeSkillService {

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRequiredSkillRepository roleRequiredSkillRepository;

    public List<EmployeeSkill> getAllEmployeeSkills() {
        return employeeSkillRepository.findAll();
    }

    public EmployeeSkill getEmployeeSkillById(Integer id) {
        return employeeSkillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill record not found with id: " + id));
    }

    public List<EmployeeSkill> getByEmployee(Integer employeeId) {
        return employeeSkillRepository.findByEmployee_EmployeeId(employeeId);
    }

    public EmployeeSkill createEmployeeSkill(EmployeeSkill employeeSkill) {
        return employeeSkillRepository.save(employeeSkill);
    }

    public EmployeeSkill updateEmployeeSkill(Integer id, EmployeeSkill updated) {
        EmployeeSkill existing = getEmployeeSkillById(id);
        existing.setEmployee(updated.getEmployee());
        existing.setSkill(updated.getSkill());
        existing.setProficiencyLevel(updated.getProficiencyLevel());
        existing.setAcquiredDate(updated.getAcquiredDate());
        return employeeSkillRepository.save(existing);
    }

    public void deleteEmployeeSkill(Integer id) {
        EmployeeSkill existing = getEmployeeSkillById(id);
        employeeSkillRepository.delete(existing);
    }

    /**
     * Compares the skills required for an employee's position (and department,
     * when a department-specific requirement exists) against what's on file for
     * them, so HR can see at a glance who needs training and in what.
     */
    public List<SkillGapItem> getSkillGap(Integer employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (employee.getPosition() == null || employee.getPosition().isBlank()) {
            return List.of();
        }

        List<RoleRequiredSkill> required = employee.getDepartment() != null
                ? roleRequiredSkillRepository.findByPositionIgnoreCaseAndDepartment_DepartmentId(
                        employee.getPosition(), employee.getDepartment().getDepartmentId())
                : roleRequiredSkillRepository.findByPositionIgnoreCase(employee.getPosition());

        // Department-agnostic requirements (department == null) apply to every
        // employee in that position regardless of department.
        List<RoleRequiredSkill> generalRequirements = roleRequiredSkillRepository.findByPositionIgnoreCase(employee.getPosition())
                .stream().filter(r -> r.getDepartment() == null).toList();

        List<RoleRequiredSkill> combined = new ArrayList<>(required);
        for (RoleRequiredSkill gen : generalRequirements) {
            boolean alreadyPresent = combined.stream().anyMatch(r -> r.getSkill().getSkillId().equals(gen.getSkill().getSkillId()));
            if (!alreadyPresent) {
                combined.add(gen);
            }
        }

        List<EmployeeSkill> ownedSkills = employeeSkillRepository.findByEmployee_EmployeeId(employeeId);

        List<SkillGapItem> gap = new ArrayList<>();
        for (RoleRequiredSkill req : combined) {
            EmployeeSkill owned = ownedSkills.stream()
                    .filter(es -> es.getSkill().getSkillId().equals(req.getSkill().getSkillId()))
                    .findFirst()
                    .orElse(null);

            if (owned == null) {
                gap.add(new SkillGapItem(req.getSkill(), req.getRequiredLevel(), null, "missing"));
            } else if (owned.getProficiencyLevel().ordinal() < req.getRequiredLevel().ordinal()) {
                gap.add(new SkillGapItem(req.getSkill(), req.getRequiredLevel(), owned.getProficiencyLevel(), "below"));
            } else {
                gap.add(new SkillGapItem(req.getSkill(), req.getRequiredLevel(), owned.getProficiencyLevel(), "met"));
            }
        }
        return gap;
    }
}
