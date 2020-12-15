const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  // Log to console for the dev
  console.log(err.stack.red);

  let error = { ...err };
  error.message = err.message;

  //Mongoose Bad Object Id
  if (err.name === 'CastError') {
    const message = `Resource with id ${err.value} not found.`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = 'Duplicate field values entered.';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
