// src/patterns/state/booking.states.js
const BookingState = require('./booking.state');

class PendingState extends BookingState {
  async confirm() {
    await this.bookingContext.updateStatus('confirmed');
    // Transition tự động sang ConfirmedState sẽ do Context đảm nhiệm sau khi update DB
  }

  async cancel() {
    await this.bookingContext.updateStatus('cancelled');
  }

  getStatus() { return 'pending'; }
}

class ConfirmedState extends BookingState {
  async complete() {
    await this.bookingContext.updateStatus('completed');
  }

  async cancel() {
    await this.bookingContext.updateStatus('cancelled');
  }

  getStatus() { return 'confirmed'; }
}

class CompletedState extends BookingState {
  // Không cho phép confirm, cancel hay complete nữa
  getStatus() { return 'completed'; }
}

class CancelledState extends BookingState {
  // Trạng thái cuối, không cho phép làm gì thêm
  getStatus() { return 'cancelled'; }
}

class DraftState extends BookingState {
  async confirm() {
    await this.bookingContext.updateStatus('confirmed');
  }

  async cancel() {
    await this.bookingContext.updateStatus('cancelled');
  }

  getStatus() { return 'draft'; }
}

module.exports = {
  DraftState,
  PendingState,
  ConfirmedState,
  CompletedState,
  CancelledState
};
