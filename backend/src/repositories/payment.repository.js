const BaseRepository = require('./base.repository');
const { Payment } = require('../models');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByBookingId(bookingId) {
    return await this.model.findOne({ where: { bookingId } });
  }

  async findByTransactionId(transactionId) {
    return await this.model.findOne({ where: { transactionId } });
  }
}

module.exports = new PaymentRepository();
