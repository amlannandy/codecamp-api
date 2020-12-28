const path = require('path');

const geocoder = require('../utils/Geocoder');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

// @description   Get all bootcamps
// @route         GET /api/v1/bootcamps
// @access        Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @description   Get single bootcamps
// @route         GET /api/v1/bootcamps/:id
// @access        Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found.`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @description   Create new bootcamp
// @route         POST /api/v1/bootcamps/
// @access        Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user;

  // Check if this user already has bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user });

  // If the user is not an admin, they can add only one bootcamp
  if (publishedBootcamp && req.user.role != 'admin') {
    return next(
      new ErrorResponse('Each publisher can have only one bootcamp.', 400)
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description   Update a bootcamp
// @route         PUT /api/v1/bootcamps/:id
// @access        Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found.`, 404)
    );
  }

  // Make sure user owns the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('User not authorized to update this bootcamp.', 401)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @description   Delete a bootcamp
// @route         DELETE /api/v1/bootcamps/:id
// @access        Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found.`, 404)
    );
  }

  // Make sure user owns the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('User not authorized to delete this bootcamp.', 401)
    );
  }

  bootcamp.remove();
  res.status(201).json({
    success: true,
    data: [],
  });
});

// @description   Get bootcamps within radius
// @route         GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access        Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat and long
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius
  // Divide distance by radius of earth
  // Radius of earth is 6378 km
  const radius = distance / 6378;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @description   Upload photo for bootcamp
// @route         PUT /api/v1/bootcamps/:id/photo
// @access        Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.id} not found.`, 404)
    );
  }

  // Make sure user owns the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('User not authorized to update this bootcamp.', 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file.`, 400));
  }
  const file = req.files.file;

  //Make sure file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image.`, 400));
  }

  // Check for file size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image with size less than ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }

  // Create custom file name then save and update
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err.red);
      new ErrorResponse(`Problem with file upload`, 500);
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  });
  const updatedBootcamp = await Bootcamp.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: updatedBootcamp,
  });
});
