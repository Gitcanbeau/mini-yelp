// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Restaurant = require('./restaurantModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have more than 10 characters!']
    },
    rating: {
      type: Number,
      required: [true, 'A rating must between 1.0 and 5.0!'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Review must belong to a restaurant.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(restaurantId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: restaurantId }
    },
    {
      $group: {
        _id: '$restaurant',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      ratingsQuantity: 0,
      ratingsAverage: 3.0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.restaurant);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.restaurant);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
