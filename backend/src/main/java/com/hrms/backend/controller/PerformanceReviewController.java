package com.hrms.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.entity.PerformanceReview;
import com.hrms.backend.services.PerformanceReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/performance-reviews")
public class PerformanceReviewController {

    @Autowired
    private PerformanceReviewService performanceReviewService;

    @GetMapping
    public ResponseEntity<List<PerformanceReview>> getAllReviews(
            @RequestParam(value = "employeeId", required = false) Integer employeeId,
            @RequestParam(value = "reviewerId", required = false) Integer reviewerId) {

        if (employeeId != null) {
            return ResponseEntity.ok(performanceReviewService.getReviewsByEmployee(employeeId));
        }
        if (reviewerId != null) {
            return ResponseEntity.ok(performanceReviewService.getReviewsByReviewer(reviewerId));
        }
        return ResponseEntity.ok(performanceReviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReview> getReviewById(@PathVariable("id") Integer reviewId) {
        return ResponseEntity.ok(performanceReviewService.getReviewById(reviewId));
    }

    @PostMapping
    public ResponseEntity<PerformanceReview> createReview(@Valid @RequestBody PerformanceReview review) {
        PerformanceReview saved = performanceReviewService.createReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerformanceReview> updateReview(@PathVariable("id") Integer reviewId,
                                                             @Valid @RequestBody PerformanceReview review) {
        return ResponseEntity.ok(performanceReviewService.updateReview(reviewId, review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Integer reviewId) {
        performanceReviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
