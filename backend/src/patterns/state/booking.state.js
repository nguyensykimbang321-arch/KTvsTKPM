// src/patterns/state/booking.state.js
class BookingState {
  constructor(bookingContext) {
    this.bookingContext = bookingContext;
  }

  async confirm() {
    throw new Error('Hành động này không hợp lệ cho trạng thái hiện tại');
  }

  async complete() {
    throw new Error('Hành động này không hợp lệ cho trạng thái hiện tại');
  }

  async cancel() {
    throw new Error('Hành động này không hợp lệ cho trạng thái hiện tại');
  }

  getStatus() {
    throw new Error('Method getStatus() must be implemented');
  }
}

module.exports = BookingState;
