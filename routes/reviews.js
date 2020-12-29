const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

const {
  getReviews,
  getReview,
  createReview,
} = require('../controllers/reviews');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protect, authorize('user'), createReview);

router.route('/:id').get(getReview);

module.exports = router;
