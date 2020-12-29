const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title.'],
    maxlength: 50,
  },
  text: {
    type: String,
    required: [true, 'Please add some text.'],
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating.'],
    min: 1,
    max: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// User can post only one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
