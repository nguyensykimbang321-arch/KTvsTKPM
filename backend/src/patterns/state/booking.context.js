// src/patterns/state/booking.context.js
const { DraftState, PendingState, ConfirmedState, CompletedState, CancelledState } = require('./booking.states');

class BookingContext {
  constructor(bookingRecord, bookingRepo) {
    this.bookingRecord = bookingRecord;
    this.bookingRepo = bookingRepo;
    this._initStateMachine();
  }

  _initStateMachine() {
    const states = {
      'draft': new DraftState(this),
      'pending': new PendingState(this),
      'confirmed': new ConfirmedState(this),
      'completed': new CompletedState(this),
      'cancelled': new CancelledState(this)
    };
    this.state = states[this.bookingRecord.status];

    if (!this.state) {
      throw new Error(`Trạng thái không hợp lệ: ${this.bookingRecord.status}`);
    }
  }

  async updateStatus(newStatus) {
    await this.bookingRepo.updateStatus(this.bookingRecord.id, newStatus);
    this.bookingRecord.status = newStatus;
    this._initStateMachine(); // Refresh state object dựa trên status mới
  }

  // Các phương thức ủy quyền cho State object
  async confirm() {
    return await this.state.confirm();
  }

  async complete() {
    return await this.state.complete();
  }

  async cancel() {
    return await this.state.cancel();
  }

  getCurrentStatus() {
    return this.state.getStatus();
  }
}

module.exports = BookingContext;
