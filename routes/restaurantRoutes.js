const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:restaurantId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(
    restaurantController.aliasTopRestaurants,
    restaurantController.getAllRestaurants
  );

router.route('/recommendation').get(restaurantController.getRecommendation);

router
  .route('/restaurants-within/:distance/center/:latlng/unit/:unit')
  .get(restaurantController.getRestaurantsWithin);

router
  .route('/')
  .get(restaurantController.getAllRestaurants)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    restaurantController.createRestaurant
  );

router
  .route('/:id')
  .get(restaurantController.getRestaurant)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    restaurantController.uploadRestaurantImages,
    restaurantController.resizeRestaurantImages,
    restaurantController.updateRestaurant
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leader'),
    restaurantController.deleteRestaurant
  );

module.exports = router;
