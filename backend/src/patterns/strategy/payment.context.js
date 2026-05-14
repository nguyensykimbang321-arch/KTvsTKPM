// src/patterns/strategy/payment.context.js
class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executePayment(orderData) {
    return await this.strategy.processPayment(orderData);
  }

  async executeVerify(params) {
    return await this.strategy.verifyPayment(params);
  }
}

module.exports = PaymentContext;
