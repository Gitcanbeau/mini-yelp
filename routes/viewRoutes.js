const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getAllRestaurants);

router.get(
  '/restaurant/:slug',
  authController.isLoggedIn,
  viewsController.getRestaurant
);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

router.get(
  '/my-booked-restaurants',
  authController.protect,
  viewsController.getMyBookedRestaurants
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
