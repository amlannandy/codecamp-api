const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

// @description Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  }
  res.status(200).json(res.advancedResults);
});

// @description Get course by Id
// @route GET /api/v1/courses/:id
// @access Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} not found.`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @description Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add bootcamp Id to course data
  req.body.bootcamp = req.params.bootcampId;

  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.params.bootcampId} not found.`,
        404
      )
    );
  }

  // Make sure user owns the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        'User not authorized to create a course for this bootcamp.',
        401
      )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    data: course,
  });
});

// @description Update a course
// @route PUT /api/v1/courses/:id
// @access Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} not found.`, 404)
    );
  }

  // Make sure user owns the bootcamp
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        'User not authorized to update a course for this bootcamp.',
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @description Delete a course
// @route DELETE /api/v1/courses/:id
// @access Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} not found.`, 404)
    );
  }

  // Make sure user owns the bootcamp
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        'User not authorized to delete a course for this bootcamp.',
        401
      )
    );
  }

  await course.remove();
  res.status(200).json({
    success: true,
    data: [],
  });
});
