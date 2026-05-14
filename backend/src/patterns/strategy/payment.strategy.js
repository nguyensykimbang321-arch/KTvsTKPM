// src/patterns/strategy/payment.strategy.js
class PaymentStrategy {
  async processPayment(orderData) {
    throw new Error('Method processPayment() must be implemented');
  }

  async verifyPayment(params) {
    throw new Error('Method verifyPayment() must be implemented');
  }
}

module.exports = PaymentStrategy;
