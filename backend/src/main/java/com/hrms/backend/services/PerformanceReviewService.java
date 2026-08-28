package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.PerformanceReview;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.PerformanceReviewRepository;

@Service
public class PerformanceReviewService {

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    public List<PerformanceReview> getAllReviews() {
        return performanceReviewRepository.findAll();
    }

    public PerformanceReview getReviewById(Integer reviewId) {
        return performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Performance review not found with id: " + reviewId));
    }

    public List<PerformanceReview> getReviewsByEmployee(Integer employeeId) {
        return performanceReviewRepository.findByEmployee_EmployeeId(employeeId);
    }

    public List<PerformanceReview> getReviewsByReviewer(Integer reviewerId) {
        return performanceReviewRepository.findByReviewer_EmployeeId(reviewerId);
    }

    public PerformanceReview createReview(PerformanceReview review) {
        return performanceReviewRepository.save(review);
    }

    public PerformanceReview updateReview(Integer reviewId, PerformanceReview updated) {
        PerformanceReview existing = getReviewById(reviewId);

        existing.setEmployee(updated.getEmployee());
        existing.setReviewer(updated.getReviewer());
        existing.setReviewPeriod(updated.getReviewPeriod());
        existing.setRating(updated.getRating());
        existing.setComments(updated.getComments());

        return performanceReviewRepository.save(existing);
    }

    public void deleteReview(Integer reviewId) {
        PerformanceReview existing = getReviewById(reviewId);
        performanceReviewRepository.delete(existing);
    }
}
