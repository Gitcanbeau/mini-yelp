const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A restaurant must have a name'],
      unique: true,
      trim: true,
      maxlength: [30, 'A restaurant name must have less than 30 characters'],
      minlength: [8, 'A restaurant name must have more than 8 characters']
      // validate: [validator.isAlpha, 'Restaurant name must only contain characters']
    },
    slug: String,
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    location: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      }
    ],
    opentime: {
      type: Number,
      required: [true, 'A restaurant must have a opentime']
    },
    endtime: {
      type: Number,
      required: [true, 'A restaurant must have a endtime']
    },
    price: {
      type: Number,
      required: [true, 'A restaurant must have a price']
    },
    priceafterDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Price after discount ({VALUE}) should be below regular price'
      }
    },
    tag: {
      type: String,
      required: [true, 'A restaurant must have a tag'],
      enum: {
        values: [
          'Chinese food',
          'Korean food',
          'Japanese food',
          'Thai food',
          'Vietnamese food',
          'American food',
          'Mexican food',
          'Italian food',
          'Brunch',
          'Barbeque',
          'Beer bar',
          'Coffee and tea',
          'Salad',
          'Vegan'
        ],
        message: 'Tag should be selected from the tag pool'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 3.0,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A restaurant must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    referee: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

restaurantSchema.index({ price: 1, ratingsAverage: -1 });
restaurantSchema.index({ slug: 1 });

restaurantSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'restaurant',
  localField: '_id'
});

restaurantSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

restaurantSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'referee',
    select: '-__v -passwordChangedAt'
  });
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
