# 🔄 Sequence Diagrams — BookingPro

## 1. Luồng Đăng ký & Đăng nhập

```mermaid
sequenceDiagram
    participant App as React Native App
    participant Route as api.routes.js
    participant MW as Middleware
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant UserRepo as UserRepository
    participant DB as MySQL

    Note over App,DB: === ĐĂNG KÝ ===
    App->>Route: POST /api/auth/register
    Route->>AuthCtrl: register(req, res)
    AuthCtrl->>AuthSvc: register(fullName, email, phone, password)
    AuthSvc->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: null (chưa tồn tại)
    UserRepo-->>AuthSvc: null
    AuthSvc->>AuthSvc: hashPassword(password)
    AuthSvc->>UserRepo: create({fullName, email, phone, hashedPassword})
    UserRepo->>DB: INSERT INTO users ...
    DB-->>UserRepo: User record
    AuthSvc->>AuthSvc: generateToken(user)
    AuthSvc-->>AuthCtrl: {user, token}
    AuthCtrl-->>App: 201 {user, token}

    Note over App,DB: === ĐĂNG NHẬP ===
    App->>Route: POST /api/auth/login
    Route->>AuthCtrl: login(req, res)
    AuthCtrl->>AuthSvc: login(email, password)
    AuthSvc->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: User record
    AuthSvc->>AuthSvc: comparePassword(password, user.password)
    AuthSvc->>AuthSvc: generateToken(user)
    AuthSvc-->>AuthCtrl: {user, token}
    AuthCtrl-->>App: 200 {user, token}
```

---

## 2. Luồng Đặt lịch hẹn ⭐ (UC05)

```mermaid
sequenceDiagram
    participant App as React Native App
    participant Route as api.routes.js
    participant MW as Auth Middleware
    participant BookCtrl as BookingController
    participant BookSvc as BookingService
    participant BookRepo as BookingRepository
    participant SvcRepo as ServiceRepository
    participant UserRepo as UserRepository
    participant State as State Pattern
    participant Observer as Observer Pattern
    participant DB as MySQL

    App->>Route: POST /api/bookings
    Route->>MW: Verify JWT Token
    MW->>BookCtrl: create(req, res)
    BookCtrl->>BookSvc: createBooking(data)

    Note over BookSvc: 1. Kiểm tra tồn tại
    BookSvc->>UserRepo: findById(staffId)
    UserRepo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>UserRepo: Staff record
    BookSvc->>SvcRepo: findById(serviceId)
    SvcRepo->>DB: SELECT * FROM services WHERE id = ?
    DB-->>SvcRepo: Service record

    Note over BookSvc: 2. ⚡ Kiểm tra xung đột Slot
    BookSvc->>BookSvc: _calculateEndTime(startTime, duration)
    BookSvc->>BookRepo: findConflictingSlots(staffId, date, start, end)
    BookRepo->>DB: SELECT bookings WHERE overlap
    DB-->>BookRepo: [] (trống = OK)

    Note over BookSvc: 3. Tạo booking
    BookSvc->>BookRepo: create({...data, endTime, totalAmount, status})
    BookRepo->>DB: INSERT INTO bookings ...
    DB-->>BookRepo: Booking record

    Note over BookSvc: 4. Observer Pattern
    BookSvc->>Observer: notify("booking_created", {booking, customer, staff})
    Observer->>DB: INSERT INTO notifications (cho staff)
    Observer->>Observer: Console log

    BookSvc-->>BookCtrl: Booking
    BookCtrl-->>App: 201 {booking}
```

---

## 3. Luồng Thanh toán VNPAY (UC06 + Strategy Pattern)

```mermaid
sequenceDiagram
    participant App as React Native App
    participant WebView as VNPayScreen (WebView)
    participant Route as api.routes.js
    participant MW as Auth Middleware
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentService
    participant Strategy as Strategy Pattern
    participant VNPay as VNPayStrategy
    participant PayRepo as PaymentRepository
    participant BookRepo as BookingRepository
    participant Observer as Observer Pattern
    participant VNPAY_GW as VNPAY Gateway
    participant DB as MySQL

    Note over App,DB: === TẠO URL THANH TOÁN ===
    App->>Route: POST /api/payments/create-vnpay
    Route->>MW: Verify JWT
    MW->>PayCtrl: createVnpayUrl(req, res)
    PayCtrl->>PaySvc: createPayment(bookingId, "vnpay")

    PaySvc->>PayRepo: create({bookingId, amount, method: "vnpay"})
    PayRepo->>DB: INSERT INTO payments ...

    Note over PaySvc: Strategy Pattern
    PaySvc->>Strategy: PaymentContext.setStrategy(VNPayStrategy)
    PaySvc->>Strategy: executePayment(orderData)
    Strategy->>VNPay: processPayment({orderId, amount, orderInfo, ipAddress})
    VNPay->>VNPay: Tạo HMAC SHA512 signature
    VNPay->>VNPay: Build VNPAY URL
    VNPay-->>Strategy: {paymentUrl, method: "vnpay"}
    Strategy-->>PaySvc: {paymentUrl}

    PaySvc-->>PayCtrl: {paymentUrl}
    PayCtrl-->>App: 200 {paymentUrl}

    Note over App,DB: === REDIRECT VÀ THANH TOÁN ===
    App->>WebView: Mở VNPayScreen với paymentUrl
    WebView->>VNPAY_GW: Load trang thanh toán
    VNPAY_GW-->>WebView: Form nhập thẻ
    WebView->>VNPAY_GW: Submit thông tin thẻ
    VNPAY_GW->>VNPAY_GW: Xử lý giao dịch

    Note over App,DB: === CALLBACK ===
    VNPAY_GW->>Route: GET /api/payments/vnpay-return?vnp_*
    Route->>PayCtrl: vnpayCallback(req, res)
    PayCtrl->>PaySvc: handleVnpayCallback(vnp_Params)

    PaySvc->>Strategy: executeVerify(vnp_Params)
    Strategy->>VNPay: verifyPayment(vnp_Params)
    VNPay->>VNPay: Verify HMAC SHA512 + ResponseCode
    VNPay-->>Strategy: true (hợp lệ)

    PaySvc->>PayRepo: updatePaymentStatus(id, "success")
    PayRepo->>DB: UPDATE payments SET status = "success"

    PaySvc->>BookRepo: updateStatus(bookingId, "confirmed")
    BookRepo->>DB: UPDATE bookings SET status = "confirmed"

    PaySvc->>Observer: notify("payment_success", {booking, customer, payment})
    Observer->>DB: INSERT INTO notifications

    PaySvc-->>PayCtrl: {success: true}
    PayCtrl-->>WebView: Redirect to success page
    WebView-->>App: Navigate back
```

---

## 4. Luồng Xác nhận & Hoàn thành Booking (UC11, UC12 + State Pattern)

```mermaid
sequenceDiagram
    participant Staff as Staff Dashboard
    participant Route as api.routes.js
    participant MW as Auth + Role Middleware
    participant BookCtrl as BookingController
    participant BookSvc as BookingService
    participant State as BookingContext
    participant BookRepo as BookingRepository
    participant Observer as Observer Pattern
    participant DB as MySQL

    Note over Staff,DB: === XÁC NHẬN BOOKING ===
    Staff->>Route: PATCH /api/bookings/:id/confirm
    Route->>MW: Verify JWT + Check role (staff/admin)
    MW->>BookCtrl: confirm(req, res)
    BookCtrl->>BookSvc: confirmBooking(bookingId, staffId, role)

    BookSvc->>BookRepo: findById(bookingId)
    BookRepo->>DB: SELECT * FROM bookings WHERE id = ?
    DB-->>BookRepo: Booking (status = "pending")

    BookSvc->>BookSvc: Kiểm tra quyền (staffId hoặc admin)

    Note over BookSvc,State: State Pattern
    BookSvc->>State: new BookingContext(booking, bookingRepo)
    State->>State: _initStateMachine() → PendingState
    BookSvc->>State: confirm()
    State->>State: PendingState.confirm()
    State->>BookRepo: updateStatus(id, "confirmed")
    BookRepo->>DB: UPDATE bookings SET status = "confirmed"
    State->>State: _initStateMachine() → ConfirmedState

    BookSvc->>Observer: notify("booking_confirmed", {booking, customer, staff})
    Observer->>DB: INSERT INTO notifications (cho customer)

    BookSvc-->>BookCtrl: Updated booking
    BookCtrl-->>Staff: 200 {booking}

    Note over Staff,DB: === HOÀN THÀNH BOOKING ===
    Staff->>Route: PATCH /api/bookings/:id/complete
    Route->>MW: Verify JWT + Check role
    MW->>BookCtrl: complete(req, res)
    BookCtrl->>BookSvc: completeBooking(bookingId, staffId)

    BookSvc->>State: new BookingContext(booking, bookingRepo)
    State->>State: _initStateMachine() → ConfirmedState
    BookSvc->>State: complete()
    State->>State: ConfirmedState.complete()
    State->>BookRepo: updateStatus(id, "completed")
    BookRepo->>DB: UPDATE bookings SET status = "completed"

    BookSvc->>Observer: notify("booking_completed", {booking, customer, staff})
    BookSvc-->>Staff: 200 {booking}
```

---

## 5. Luồng Hủy lịch & Hoàn tiền (UC08)

```mermaid
sequenceDiagram
    participant App as React Native App
    participant Route as api.routes.js
    participant MW as Auth Middleware
    participant BookCtrl as BookingController
    participant BookSvc as BookingService
    participant State as BookingContext
    participant BookRepo as BookingRepository
    participant PayModel as Payment Model
    participant Observer as Observer Pattern
    participant DB as MySQL

    App->>Route: PATCH /api/bookings/:id/cancel
    Route->>MW: Verify JWT
    MW->>BookCtrl: cancel(req, res)
    BookCtrl->>BookSvc: refundBooking(bookingId, userId, reason)

    BookSvc->>BookRepo: findById(bookingId)
    BookRepo->>DB: SELECT * FROM bookings
    DB-->>BookRepo: Booking (status = "confirmed")

    Note over BookSvc: Tính hoàn tiền
    BookSvc->>BookSvc: _calculateRefundPercentage(bookingDate, startTime)
    Note right of BookSvc: >= 1 tiếng → 100%
    Note right of BookSvc: < 1 tiếng → 50%
    Note right of BookSvc: Quá giờ → 0%

    BookSvc->>BookRepo: update(id, {status: cancelled, cancelReason, cancelledAt})
    BookRepo->>DB: UPDATE bookings ...

    BookSvc->>PayModel: findOne({where: {bookingId}})
    PayModel->>DB: SELECT * FROM payments
    DB-->>PayModel: Payment (status = "success")

    alt Có hoàn tiền (refundAmount > 0)
        BookSvc->>PayModel: update({refundAmount, refundedAt, status: "refunded"})
        PayModel->>DB: UPDATE payments ...
    end

    BookSvc->>Observer: notify("booking_refunded", {booking, customer, staff, refundAmount, refundPercentage})
    Observer->>Observer: LoggingObserver ghi log hoàn tiền

    BookSvc-->>BookCtrl: {booking, refundAmount, refundPercentage, message}
    BookCtrl-->>App: 200 {result}
```

---

## 6. Luồng Cron Job — Tự động hủy booking quá hạn (UC20)

```mermaid
sequenceDiagram
    participant Cron as node-cron
    participant Reminder as ReminderService
    participant BookRepo as BookingRepository
    participant DB as MySQL

    Note over Cron: Chạy định kỳ theo lịch
    Cron->>Reminder: cancelExpiredBookings()
    Reminder->>BookRepo: findPendingExpired()
    BookRepo->>DB: SELECT * FROM bookings WHERE status = "pending" AND bookingDate + startTime < NOW()
    DB-->>BookRepo: [Expired bookings]

    loop Với mỗi booking quá hạn
        Reminder->>BookRepo: updateStatus(booking.id, "cancelled")
        BookRepo->>DB: UPDATE bookings SET status = "cancelled"
    end

    Reminder-->>Cron: Completed
```
