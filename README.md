# 🏢 BookingPro — Hệ thống Quản lý Đặt lịch & Thanh toán Dịch vụ

## 📖 Giới thiệu

**BookingPro** là nền tảng quản lý đặt lịch và thanh toán dịch vụ, cho phép khách hàng đặt lịch hẹn trực tuyến, thanh toán qua nhiều phương thức (VNPAY, COD), và nhận thông báo real-time về trạng thái đặt lịch.

Dự án được thiết kế theo kiến trúc **3-Tier** kết hợp mô hình **MVC**, áp dụng các **Design Patterns** phổ biến để đảm bảo tính mở rộng, bảo trì và tái sử dụng.

---

## 🎯 Mục tiêu dự án

- Xây dựng hệ thống đặt lịch dịch vụ hoàn chỉnh
- Áp dụng kiến trúc phần mềm bài bản (3-Tier, MVC)
- Triển khai 4 Design Patterns có lý do rõ ràng
- Thiết kế UML đầy đủ (Use Case, Class, Sequence, Component)
- Xử lý logic phức tạp (không chỉ CRUD)

---

## 🏗️ Kiến trúc hệ thống

### 3-Tier Architecture

```
┌──────────────────────────────────┐
│     PRESENTATION TIER            │
│     React Native (Expo SDK 54)   │
│     (Screens, Components, UI)    │
└──────────────┬───────────────────┘
               │ REST API (HTTP/JSON)
┌──────────────▼───────────────────┐
│     BUSINESS LOGIC TIER          │
│     Node.js + Express.js         │
│     (Controllers, Services,      │
│      Patterns, Middlewares)      │
└──────────────┬───────────────────┘
               │ Sequelize ORM
┌──────────────▼───────────────────┐
│     DATA TIER                    │
│     MySQL Database               │
│     (Tables, Relations, Indexes) │
└──────────────────────────────────┘
```

### MVC Pattern (Backend)

```
Request → Route → Middleware (Auth/Role) → Controller → Service → Repository → Model → Database
                                              ↓
                                          Response (JSON)
```

---

## 🧩 Design Patterns

| # | Pattern | Áp dụng | Lý do |
|---|---------|---------|-------|
| 1 | **Strategy** | Phương thức thanh toán (VNPAY, COD) | Dễ mở rộng thêm cổng thanh toán mới mà không sửa code cũ (Open/Closed Principle) |
| 2 | **State** | Trạng thái Booking (pending → confirmed → completed / cancelled) | Quản lý chuyển trạng thái hợp lệ, loại bỏ if-else phức tạp |
| 3 | **Observer** | Hệ thống Notification & Logging | Tách biệt logic thông báo/ghi log khỏi nghiệp vụ chính (Single Responsibility) |
| 4 | **Repository** | Tầng truy xuất dữ liệu | Tách query khỏi business logic, dễ thay đổi DB (Dependency Inversion) |
| 5 | **Singleton** | Khởi tạo Database Connection (Sequelize), Axios Client, các Services & Repositories | Khởi tạo đối tượng duy nhất một lần để tránh tạo lại lãng phí bộ nhớ, đồng bộ hóa cấu hình (JWT, API URL) và tránh cạn kiệt pool kết nối |

---

## 👥 Actors

| Actor | Mô tả |
|-------|-------|
| **Khách hàng (Customer)** | Đăng ký, đặt lịch, thanh toán, xem lịch sử, hủy lịch, xem thông báo |
| **Nhân viên (Staff)** | Xem lịch làm việc, xác nhận/hoàn thành booking, xem thông báo |
| **Quản trị viên (Admin)** | Quản lý danh mục, dịch vụ, nhân viên, lịch nhân viên, báo cáo doanh thu |
| **Hệ thống VNPAY** | Xử lý giao dịch thanh toán online, callback xác nhận |
| **Hệ thống (Cron Job)** | Tự động nhắc nhở & hủy booking quá hạn |

---

## ⚙️ Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React Native + Expo SDK 54 |
| UI/Font | Inter, Outfit (Google Fonts), Lucide Icons |
| Navigation | React Navigation 7 (Native Stack + Bottom Tabs) |
| Backend | Node.js + Express.js |
| Database | MySQL |
| ORM | Sequelize 6 |
| Authentication | JWT (JSON Web Token) + Bcrypt.js |
| Payment Gateway | VNPAY |
| Scheduler | node-cron |
| API Format | RESTful JSON |

---

## 📁 Cấu trúc thư mục

```
KTvsTKPM/
├── README.md
├── docs/                              # Tài liệu thiết kế
│   ├── architecture.md                # Kiến trúc hệ thống
│   ├── database-design.md             # Thiết kế CSDL
│   ├── design-patterns.md             # Design Patterns chi tiết
│   └── uml/                           # Các UML Diagrams
│       ├── use-case.md                # Use Case Diagram
│       ├── class-diagram.md           # Class Diagram
│       ├── sequence-diagram.md        # Sequence Diagram
│       └── component-diagram.md       # Component Diagram
│
├── backend/                           # Backend API
│   ├── package.json
│   ├── .env                           # Biến môi trường
│   └── src/
│       ├── app.js                     # Entry point, middleware, cron jobs
│       ├── config/
│       │   └── database.js            # Sequelize connection config
│       ├── models/                    # Sequelize Models
│       │   ├── index.js               # Model loader + associations
│       │   ├── user.model.js
│       │   ├── category.model.js
│       │   ├── service.model.js
│       │   ├── staffSchedule.model.js
│       │   ├── booking.model.js
│       │   ├── payment.model.js
│       │   └── notification.model.js
│       ├── repositories/              # Repository Pattern
│       │   ├── base.repository.js     # Base CRUD operations
│       │   ├── user.repository.js
│       │   ├── service.repository.js
│       │   ├── staffSchedule.repository.js
│       │   ├── booking.repository.js
│       │   ├── payment.repository.js
│       │   └── notification.repository.js
│       ├── services/                  # Business Logic
│       │   ├── auth.service.js
│       │   ├── booking.service.js
│       │   ├── payment.service.js
│       │   └── reminder.service.js    # Cron job: nhắc nhở & tự động hủy
│       ├── controllers/               # Request handlers
│       │   ├── auth.controller.js
│       │   ├── booking.controller.js
│       │   ├── category.controller.js
│       │   ├── service.controller.js
│       │   ├── staff.controller.js
│       │   └── payment.controller.js
│       ├── routes/
│       │   └── api.routes.js          # Tập trung tất cả route definitions
│       ├── middlewares/
│       │   └── index.js               # Auth JWT + Role-based access
│       └── patterns/                  # Design Patterns
│           ├── strategy/              # Payment Strategy Pattern
│           │   ├── payment.strategy.js    # Interface (abstract class)
│           │   ├── payment.context.js     # Context
│           │   ├── vnpay.strategy.js      # VNPAY implementation
│           │   └── cod.strategy.js        # COD implementation
│           ├── state/                 # Booking State Pattern
│           │   ├── booking.state.js       # Interface (abstract class)
│           │   ├── booking.context.js     # Context
│           │   └── booking.states.js      # Concrete states (Pending, Confirmed, Completed, Cancelled)
│           └── observer/              # Notification Observer Pattern
│               ├── subject.js             # Subject (EventEmitter)
│               ├── observer.js            # Observer interface
│               ├── notification.observer.js # Notification concrete observer
│               └── logging.observer.js    # Logging concrete observer
│
└── frontend/                          # React Native (Expo) App
    ├── package.json
    ├── app.json                       # Expo config
    ├── App.js                         # Root component (font loading, navigation)
    ├── index.js                       # Entry point
    └── src/
        ├── theme/
        │   └── theme.js               # Design tokens (colors, spacing, typography)
        ├── components/
        │   ├── Common.js              # Shared UI components
        │   └── BottomNav.js           # Bottom navigation bar
        ├── navigation/
        │   ├── AppNavigator.js        # Root navigator (Auth vs Main)
        │   └── MainTabNavigator.js    # Bottom tab navigator
        ├── screens/
        │   ├── LoginScreen.js         # Đăng nhập
        │   ├── RegisterScreen.js      # Đăng ký
        │   ├── HomeScreen.js          # Trang chủ — danh sách dịch vụ
        │   ├── ExploreScreen.js       # Khám phá dịch vụ
        │   ├── BookingScreen.js       # Đặt lịch hẹn
        │   ├── PaymentScreen.js       # Chọn phương thức thanh toán
        │   ├── VNPayScreen.js         # WebView trang thanh toán VNPAY
        │   ├── HistoryScreen.js       # Lịch sử đặt lịch
        │   ├── NotificationScreen.js  # Thông báo
        │   ├── ProfileScreen.js       # Hồ sơ cá nhân
        │   ├── StaffDashboardScreen.js    # Dashboard nhân viên
        │   ├── AdminDashboardScreen.js    # Dashboard quản trị
        │   ├── ManageCategoriesScreen.js  # Quản lý danh mục
        │   ├── ManageServicesScreen.js    # Quản lý dịch vụ
        │   ├── ManageStaffScreen.js       # Quản lý nhân viên
        │   └── RevenueScreen.js           # Báo cáo doanh thu
        └── services/
            └── api.js                 # Axios instance + API endpoints
```

---

## 🔴 Logic phức tạp (không chỉ CRUD)

### 1. Thuật toán kiểm tra xung đột Slot
Khi khách đặt lịch, hệ thống kiểm tra:
- Nhân viên đã có lịch trong khung giờ đó chưa?
- Slot đã đầy chưa?
- Thời gian đặt có hợp lệ (trong giờ làm việc)?

### 2. State Machine — Booking
```
                    ┌──────────┐
         ┌─────────│ PENDING  │──────────┐
         │         └──────────┘          │
     [confirm]                       [cancel]
         │                               │
         ▼                               ▼
   ┌───────────┐                  ┌───────────┐
   │ CONFIRMED │──[cancel]───────>│ CANCELLED │
   └───────────┘                  └───────────┘
         │
     [complete]
         │
         ▼
   ┌───────────┐
   │ COMPLETED │
   └───────────┘
```

### 3. Quy tắc hủy lịch & hoàn tiền
- Hủy trước **≥ 1 tiếng** so với giờ hẹn → Hoàn tiền 100%
- Hủy trong vòng **< 1 tiếng** trước giờ hẹn → Hoàn tiền 50%
- Hủy **sau giờ hẹn** (quá giờ) → Không hoàn tiền

### 4. Thanh toán VNPAY (Strategy Pattern)
Luồng: Tạo booking → Chọn phương thức → VNPayStrategy tạo URL → WebView redirect → Callback → Verify signature → Cập nhật trạng thái

### 5. Cron Job — Tự động nhắc nhở & hủy booking
- **Reminder Service** chạy theo lịch (node-cron), tự động hủy các booking `pending` đã quá hạn thời gian đặt lịch

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- MySQL >= 8.0
- Expo CLI (`npm install -g expo-cli`)

### Backend
```bash
cd backend
npm install
# Cấu hình database trong .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
# Quét QR code bằng Expo Go app trên điện thoại
```

---

## 📚 Tài liệu thiết kế

| Tài liệu | Mô tả |
|-----------|--------|
| [Kiến trúc hệ thống](docs/architecture.md) | 3-Tier Architecture, MVC, luồng xử lý request |
| [Thiết kế Database](docs/database-design.md) | ERD, chi tiết bảng, SQL schema, seed data |
| [Design Patterns](docs/design-patterns.md) | Strategy, State, Observer, Repository — code minh họa |
| [Use Case Diagram](docs/uml/use-case.md) | Sơ đồ UC tổng thể + mô tả chi tiết |
| [Class Diagram](docs/uml/class-diagram.md) | Class diagram toàn hệ thống |
| [Sequence Diagram](docs/uml/sequence-diagram.md) | Các luồng nghiệp vụ chính |
| [Component Diagram](docs/uml/component-diagram.md) | Kiến trúc component |
