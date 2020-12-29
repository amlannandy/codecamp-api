const Course = require('../models/Course');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

// @description Get all reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  }
  res.status(200).json(res.advancedResults);
});

// @description Get a review
// @route GET /api/v1/reviews/:id
// @access Public

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(new ErrorResponse("Review doesn't exist", 404));
  }
  res.status(200).json({ success: true, data: review });
});

// @description Create a review
// @route POST /api/v1/bootcamps/:bootcampId/reviews/
// @access Private

exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp doesn't exist", 404));
  }

  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});
