const bookingService = require('../services/booking.service');

class BookingController {
  async create(req, res, next) {
    try {
      const bookingData = { ...req.body, customerId: req.user.id };
      const booking = await bookingService.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const bookings = await bookingService.getMyBookings(req.user.id, req.user.role);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.confirmBooking(id, req.user.id, req.user.role);
      res.json({ message: 'Xác nhận lịch hẹn thành công', data: booking });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(id, req.user.id, req.user.role, reason);
      res.json({ message: 'Hủy lịch hẹn thành công', data: booking });
    } catch (error) {
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.completeBooking(id, req.user.id);
      res.json({ message: 'Hoàn thành lịch hẹn thành công', data: booking });
    } catch (error) {
      next(error);
    }
  }

  async refund(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await bookingService.refundBooking(id, req.user.id, req.user.role, reason);
      res.json({ message: 'Hoàn tiền lịch hẹn thành công', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBusySlots(req, res, next) {
    try {
      const { staffId, date } = req.query;
      const busySlots = await bookingService.getBusySlots(staffId, date);
      res.json(busySlots);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
