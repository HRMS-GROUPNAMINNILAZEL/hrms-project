const express = require('express');
const { PerformanceReview, Employee, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function populateReview(rev) {
  const revObj = rev.toObject ? rev.toObject() : rev;
  const employee = await Employee.findOne({ employeeId: rev.employeeId });
  const reviewer = rev.reviewerId ? await Employee.findOne({ employeeId: rev.reviewerId }) : null;
  return {
    ...revObj,
    employee: employee ? {
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      departmentId: employee.departmentId
    } : null,
    reviewer: reviewer ? {
      employeeId: reviewer.employeeId,
      firstName: reviewer.firstName,
      lastName: reviewer.lastName,
      position: reviewer.position,
      departmentId: reviewer.departmentId
    } : null,
    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${rev.employeeId}`,
    employeePosition: employee ? employee.position : null,
    reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : (rev.reviewerId ? `Reviewer #${rev.reviewerId}` : 'Admin')
  };
}

// GET performance reviews (employees see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employeeId, reviewerId } = req.query;
    const filter = {};

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) return res.json([]);
      filter.employeeId = currentEmp.employeeId;
    } else {
      if (employeeId) filter.employeeId = parseInt(employeeId);
      if (reviewerId) filter.reviewerId = parseInt(reviewerId);
    }

    const reviews = await PerformanceReview.find(filter).sort({ createdAt: -1, reviewId: -1 }).lean();
    const populatedReviews = await Promise.all(reviews.map(populateReview));

    res.json(populatedReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single review
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const review = await PerformanceReview.findOne({ reviewId });
    if (!review) return res.status(404).json({ message: 'Performance review not found' });

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp || currentEmp.employeeId !== review.employeeId) {
        return res.status(403).json({ message: 'Access denied: cannot view another employee\'s performance review' });
      }
    }

    const populated = await populateReview(review);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create performance review (HR, Admin, Manager)
router.post('/', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const rawEmployeeId = req.body.employeeId !== undefined && req.body.employeeId !== ''
      ? req.body.employeeId
      : req.body.employee?.employeeId;
    const rawReviewerId = req.body.reviewerId !== undefined && req.body.reviewerId !== ''
      ? req.body.reviewerId
      : (req.body.reviewer?.employeeId !== undefined ? req.body.reviewer?.employeeId : req.user?.userId);

    const { reviewPeriod, rating, comments } = req.body;

    if (!rawEmployeeId || !reviewPeriod || rating === undefined || rating === null || rating === '') {
      return res.status(400).json({ message: 'employeeId, reviewPeriod, and rating are required' });
    }

    const reviewId = await getNextSequence('reviewId');
    const newReview = new PerformanceReview({
      reviewId,
      employeeId: parseInt(rawEmployeeId),
      reviewerId: rawReviewerId ? parseInt(rawReviewerId) : null,
      reviewPeriod,
      rating: parseFloat(rating),
      comments: comments || '',
      createdAt: new Date()
    });

    await newReview.save();
    const populated = await populateReview(newReview);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update performance review (HR, Admin, Manager)
router.put('/:id', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { reviewPeriod, rating, comments } = req.body;

    const rawEmployeeId = req.body.employeeId !== undefined
      ? req.body.employeeId
      : req.body.employee?.employeeId;
    const rawReviewerId = req.body.reviewerId !== undefined
      ? req.body.reviewerId
      : req.body.reviewer?.employeeId;

    const review = await PerformanceReview.findOne({ reviewId });
    if (!review) return res.status(404).json({ message: 'Performance review not found' });

    if (rawEmployeeId !== undefined && rawEmployeeId !== '') review.employeeId = parseInt(rawEmployeeId);
    if (rawReviewerId !== undefined && rawReviewerId !== '') review.reviewerId = parseInt(rawReviewerId);
    if (reviewPeriod !== undefined) review.reviewPeriod = reviewPeriod;
    if (rating !== undefined && rating !== null && rating !== '') review.rating = parseFloat(rating);
    if (comments !== undefined) review.comments = comments;

    await review.save();
    const populated = await populateReview(review);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE performance review (HR, Admin)
router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const deleted = await PerformanceReview.findOneAndDelete({ reviewId });
    if (!deleted) return res.status(404).json({ message: 'Performance review not found' });
    res.json({ message: 'Performance review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
