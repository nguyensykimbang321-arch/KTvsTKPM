// src/patterns/observer/subject.js
class Subject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  async notify(event, data) {
    for (const observer of this.observers) {
      await observer.update(event, data);
    }
  }
}

module.exports = Subject;
