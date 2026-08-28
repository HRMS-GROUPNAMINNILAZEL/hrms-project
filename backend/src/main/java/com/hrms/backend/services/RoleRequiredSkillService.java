package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.RoleRequiredSkill;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.RoleRequiredSkillRepository;

@Service
public class RoleRequiredSkillService {

    @Autowired
    private RoleRequiredSkillRepository roleRequiredSkillRepository;

    public List<RoleRequiredSkill> getAll() {
        return roleRequiredSkillRepository.findAll();
    }

    public RoleRequiredSkill getById(Integer id) {
        return roleRequiredSkillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role skill requirement not found with id: " + id));
    }

    public RoleRequiredSkill create(RoleRequiredSkill entity) {
        return roleRequiredSkillRepository.save(entity);
    }

    public RoleRequiredSkill update(Integer id, RoleRequiredSkill updated) {
        RoleRequiredSkill existing = getById(id);
        existing.setPosition(updated.getPosition());
        existing.setDepartment(updated.getDepartment());
        existing.setSkill(updated.getSkill());
        existing.setRequiredLevel(updated.getRequiredLevel());
        return roleRequiredSkillRepository.save(existing);
    }

    public void delete(Integer id) {
        RoleRequiredSkill existing = getById(id);
        roleRequiredSkillRepository.delete(existing);
    }
}
