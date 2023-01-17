const Restaurant = require('../models/restaurantModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking is successful! A confirmation letter is sent to your email.';
  next();
};

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.find();
  res.status(200).render('overview', {
    title: 'All Restaurants',
    restaurants
  });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({
    slug: req.params.slug
  }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!restaurant) {
    return next(new AppError('There is no restaurant with that name.', 404));
  }

  res.status(200).render('restaurant', {
    title: `${restaurant.name} Restaurant`,
    restaurant
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyBookedRestaurants = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const restaurantIDs = bookings.map(el => el.restaurant);
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIDs } });

  res.status(200).render('overview', {
    title: 'My Booked Restaurants',
    restaurants
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
