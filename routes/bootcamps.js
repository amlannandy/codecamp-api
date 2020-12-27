const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadBootcampPhoto,
  getBootcampsInRadius,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const coursesRouter = require('./courses');

// Reroute into other resource router
router.use('/:bootcampId/courses', coursesRouter);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadBootcampPhoto);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// api/v1/bootcamps
router
  .route('/')
  .get(
    advancedResults(Bootcamp, {
      path: 'courses',
      select: 'title description',
    }),
    getBootcamps
  )
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

module.exports = router;
