const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const bookingController = require('../controllers/booking.controller');
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Booking Routes
router.post('/bookings', authMiddleware, bookingController.create);
router.get('/bookings/my', authMiddleware, bookingController.getMyBookings);
router.patch('/bookings/:id/confirm', authMiddleware, roleMiddleware(['staff', 'admin']), bookingController.confirm);
router.patch('/bookings/:id/cancel', authMiddleware, bookingController.cancel);
router.patch('/bookings/:id/complete', authMiddleware, roleMiddleware(['staff', 'admin']), bookingController.complete);
router.patch('/bookings/:id/refund', authMiddleware, roleMiddleware(['customer', 'admin']), bookingController.refund);
router.get('/bookings/busy-slots', bookingController.getBusySlots);

// Payment Routes
router.post('/payments/initiate', authMiddleware, paymentController.initiate);
router.get('/app/bookings/vnpay_return', paymentController.vnpayReturn);
router.get('/payments/vnpay-return', paymentController.vnpayReturn);
router.get('/payments/vnpay-ipn', paymentController.vnpayIpn);

// Service Routes
const serviceController = require('../controllers/service.controller');
const staffController = require('../controllers/staff.controller');
const categoryController = require('../controllers/category.controller');
router.get('/services', serviceController.getAll);
router.get('/staffs', staffController.getByService);
router.get('/staffs/:staffId/schedules', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.getSchedules);
router.post('/staffs/:staffId/schedules', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.createSchedule);
router.patch('/staffs/:staffId/schedules/:scheduleId', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.updateSchedule);
router.delete('/staffs/:staffId/schedules/:scheduleId', authMiddleware, roleMiddleware(['staff', 'admin']), staffController.deleteSchedule);
router.get('/categories', categoryController.getAll);

module.exports = router;
