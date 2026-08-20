package com.hrms.backend.services;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Payroll;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.PayrollRepository;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    public List<Payroll> getAllPayroll() {
        return payrollRepository.findAll();
    }

    public Payroll getPayrollById(Integer payrollId) {
        return payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with id: " + payrollId));
    }

    public List<Payroll> getPayrollByEmployee(Integer employeeId) {
        return payrollRepository.findByEmployee_EmployeeId(employeeId);
    }

    public Payroll createPayroll(Payroll payroll) {
        calculateNetPay(payroll);
        return payrollRepository.save(payroll);
    }

    public Payroll updatePayroll(Integer payrollId, Payroll updatedPayroll) {
        Payroll existing = getPayrollById(payrollId);

        existing.setEmployee(updatedPayroll.getEmployee());
        existing.setPayPeriodStart(updatedPayroll.getPayPeriodStart());
        existing.setPayPeriodEnd(updatedPayroll.getPayPeriodEnd());
        existing.setBasicSalary(updatedPayroll.getBasicSalary());
        existing.setDeductions(updatedPayroll.getDeductions());
        existing.setBonuses(updatedPayroll.getBonuses());

        calculateNetPay(existing);
        return payrollRepository.save(existing);
    }

    public void deletePayroll(Integer payrollId) {
        Payroll existing = getPayrollById(payrollId);
        payrollRepository.delete(existing);
    }

    // net pay = basic salary - deductions + bonuses, always derived server-side
    private void calculateNetPay(Payroll payroll) {
        BigDecimal basic = payroll.getBasicSalary() != null ? payroll.getBasicSalary() : BigDecimal.ZERO;
        BigDecimal deductions = payroll.getDeductions() != null ? payroll.getDeductions() : BigDecimal.ZERO;
        BigDecimal bonuses = payroll.getBonuses() != null ? payroll.getBonuses() : BigDecimal.ZERO;

        payroll.setNetPay(basic.subtract(deductions).add(bonuses));
    }
}
