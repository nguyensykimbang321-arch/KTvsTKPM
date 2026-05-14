# 📐 Class Diagram — BookingPro

## 1. Class Diagram tổng thể

```mermaid
classDiagram
    %% ===== MODELS =====
    class User {
        -int id
        -string fullName
        -string email
        -string phone
        -string password
        -enum role
        -boolean isActive
        -datetime createdAt
        -datetime updatedAt
        +getBookings() Booking[]
        +getNotifications() Notification[]
    }

    class Service {
        -int id
        -string name
        -string description
        -decimal price
        -int durationMinutes
        -string imageUrl
        -boolean isActive
        +getStaffSchedules() StaffSchedule[]
    }

    class StaffSchedule {
        -int id
        -int staffId
        -int serviceId
        -enum dayOfWeek
        -time startTime
        -time endTime
        -boolean isAvailable
        +getStaff() User
        +getService() Service
    }

    class Booking {
        -int id
        -int customerId
        -int staffId
        -int serviceId
        -date bookingDate
        -time startTime
        -time endTime
        -enum status
        -string note
        -decimal totalAmount
        -datetime cancelledAt
        -string cancelReason
        +getCustomer() User
        +getStaff() User
        +getService() Service
        +getPayment() Payment
    }

    class Payment {
        -int id
        -int bookingId
        -decimal amount
        -enum method
        -enum status
        -string transactionId
        -string vnpayResponseCode
        -decimal refundAmount
        -datetime paidAt
        -datetime refundedAt
        +getBooking() Booking
    }

    class Notification {
        -int id
        -int userId
        -int bookingId
        -string title
        -string message
        -enum type
        -boolean isRead
        +getUser() User
        +getBooking() Booking
    }

    %% ===== RELATIONSHIPS =====
    User "1" --> "*" Booking : creates
    User "1" --> "*" Booking : serves
    User "1" --> "*" StaffSchedule : has
    User "1" --> "*" Notification : receives
    Service "1" --> "*" Booking : booked in
    Service "1" --> "*" StaffSchedule : provided by
    Booking "1" --> "0..1" Payment : has
    Booking "1" --> "*" Notification : triggers

    %% ===== REPOSITORIES =====
    class BaseRepository {
        #model: Model
        +findAll(options) Array
        +findById(id) Object
        +create(data) Object
        +update(id, data) Object
        +delete(id) boolean
    }

    class BookingRepository {
        +findByCustomer(customerId) Booking[]
        +findByStaffAndDate(staffId, date) Booking[]
        +findConflictingSlots(staffId, date, start, end) Booking[]
        +updateStatus(id, status) Booking
    }

    class UserRepository {
        +findByEmail(email) User
        +findStaffByService(serviceId) User[]
    }

    class PaymentRepository {
        +findByBookingId(bookingId) Payment
        +updatePaymentStatus(id, status) Payment
    }

    class NotificationRepository {
        +findByUser(userId) Notification[]
        +markAsRead(id) Notification
        +markAllAsRead(userId) void
    }

    BaseRepository <|-- BookingRepository
    BaseRepository <|-- UserRepository
    BaseRepository <|-- PaymentRepository
    BaseRepository <|-- NotificationRepository

    %% ===== SERVICES =====
    class AuthService {
        -userRepository: UserRepository
        +register(data) User
        +login(email, password) Token
        -hashPassword(password) string
        -comparePassword(plain, hashed) boolean
        -generateToken(user) string
    }

    class BookingService {
        -bookingRepo: BookingRepository
        -scheduleRepo: StaffScheduleRepository
        -stateContext: BookingContext
        -eventEmitter: BookingEventEmitter
        +createBooking(data) Booking
        +confirmBooking(id) Booking
        +completeBooking(id) Booking
        +cancelBooking(id, reason) Booking
        +getCustomerBookings(customerId) Booking[]
        -checkSlotConflict(staffId, date, start, end) boolean
        -calculateRefund(booking) decimal
    }

    class PaymentService {
        -paymentRepo: PaymentRepository
        -paymentContext: PaymentContext
        +createPayment(bookingId, method) PaymentResult
        +handleVnpayCallback(data) Payment
        +processRefund(paymentId, amount) RefundResult
    }

    class NotificationService {
        -notifRepo: NotificationRepository
        +getUserNotifications(userId) Notification[]
        +markAsRead(id) Notification
        +markAllAsRead(userId) void
    }

    %% ===== Service Dependencies =====
    AuthService --> UserRepository
    BookingService --> BookingRepository
    BookingService --> BookingContext
    BookingService --> BookingEventEmitter
    PaymentService --> PaymentRepository
    PaymentService --> PaymentContext
    NotificationService --> NotificationRepository

    %% ===== STRATEGY PATTERN =====
    class PaymentStrategy {
        <<interface>>
        +processPayment(data) PaymentResult
        +verifyPayment(data) boolean
        +refund(id, amount) RefundResult
    }

    class VNPayStrategy {
        -tmnCode: string
        -secretKey: string
        +processPayment(data) PaymentResult
        +verifyPayment(data) boolean
        +refund(id, amount) RefundResult
        -createSignature(data) string
        -buildPaymentUrl(orderId, amount, returnUrl) string
    }

    class CODStrategy {
        +processPayment(data) PaymentResult
        +verifyPayment(data) boolean
        +refund(id, amount) RefundResult
    }

    class PaymentContext {
        -strategy: PaymentStrategy
        +setStrategy(strategy) void
        +executePayment(data) PaymentResult
        +executeVerify(data) boolean
        +executeRefund(id, amount) RefundResult
    }

    PaymentStrategy <|.. VNPayStrategy
    PaymentStrategy <|.. CODStrategy
    PaymentContext --> PaymentStrategy

    %% ===== STATE PATTERN =====
    class BookingState {
        <<interface>>
        +confirm(context) void
        +cancel(context) void
        +complete(context) void
        +getStatus() string
    }

    class PendingState {
        +confirm(context) void
        +cancel(context) void
        +complete(context) void
        +getStatus() string
    }

    class ConfirmedState {
        +confirm(context) void
        +cancel(context) void
        +complete(context) void
        +getStatus() string
    }

    class CompletedState {
        +confirm(context) void
        +cancel(context) void
        +complete(context) void
        +getStatus() string
    }

    class CancelledState {
        +confirm(context) void
        +cancel(context) void
        +complete(context) void
        +getStatus() string
    }

    class BookingContext {
        -state: BookingState
        +setState(state) void
        +confirm() void
        +cancel() void
        +complete() void
        +getStatus() string
    }

    BookingState <|.. PendingState
    BookingState <|.. ConfirmedState
    BookingState <|.. CompletedState
    BookingState <|.. CancelledState
    BookingContext --> BookingState

    %% ===== OBSERVER PATTERN =====
    class BookingEventEmitter {
        -listeners: Map
        +on(event, listener) void
        +emit(event, data) void
        +off(event, listener) void
    }

    class BookingObserver {
        <<interface>>
        +update(eventType, data) void
    }

    class NotificationObserver {
        -notifRepo: NotificationRepository
        +update(eventType, data) void
    }

    class LogObserver {
        +update(eventType, data) void
    }

    BookingObserver <|.. NotificationObserver
    BookingObserver <|.. LogObserver
    BookingEventEmitter --> BookingObserver

    %% ===== CONTROLLERS =====
    class AuthController {
        -authService: AuthService
        +register(req, res) void
        +login(req, res) void
    }

    class BookingController {
        -bookingService: BookingService
        +create(req, res) void
        +getById(req, res) void
        +getMyBookings(req, res) void
        +confirm(req, res) void
        +complete(req, res) void
        +cancel(req, res) void
    }

    class PaymentController {
        -paymentService: PaymentService
        +createVnpayUrl(req, res) void
        +vnpayCallback(req, res) void
    }

    AuthController --> AuthService
    BookingController --> BookingService
    PaymentController --> PaymentService
```

---

## 2. Giải thích quan hệ chính

### Models
| Quan hệ | Kiểu | Ý nghĩa |
|---------|------|---------|
| User → Booking | 1:N | Khách tạo nhiều booking |
| User → Booking (staff) | 1:N | Nhân viên phục vụ nhiều booking |
| Service → Booking | 1:N | Dịch vụ được đặt nhiều lần |
| Booking → Payment | 1:1 | Mỗi booking có 1 thanh toán |
| Booking → Notification | 1:N | Mỗi booking sinh nhiều thông báo |

### Layers
| Tầng | Class | Phụ thuộc |
|------|-------|-----------|
| Controller | AuthController, BookingController | → Service |
| Service | BookingService, PaymentService | → Repository + Patterns |
| Repository | BookingRepository, UserRepository | → Model |
| Patterns | Strategy, State, Observer | Được inject vào Service |

---

## 3. Nguyên tắc thiết kế

1. **Dependency Injection**: Service nhận Repository qua constructor, không tạo trực tiếp
2. **Interface Segregation**: Mỗi pattern có interface riêng (PaymentStrategy, BookingState, BookingObserver)
3. **Single Responsibility**: Controller chỉ nhận/trả request, Service xử lý logic, Repository truy vấn data
4. **Open/Closed**: Thêm payment method mới = tạo class mới implement PaymentStrategy, không sửa code cũ
