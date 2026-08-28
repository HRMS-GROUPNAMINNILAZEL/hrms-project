package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Skill;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.SkillRepository;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(Integer skillId) {
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));
    }

    public Skill createSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public Skill updateSkill(Integer skillId, Skill updated) {
        Skill existing = getSkillById(skillId);
        existing.setSkillName(updated.getSkillName());
        existing.setCategory(updated.getCategory());
        return skillRepository.save(existing);
    }

    public void deleteSkill(Integer skillId) {
        Skill existing = getSkillById(skillId);
        skillRepository.delete(existing);
    }
}
