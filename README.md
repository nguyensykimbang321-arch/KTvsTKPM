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
│     React Native Mobile App      │
│     (Screens, Components, UI)    │
└──────────────┬───────────────────┘
               │ REST API (HTTP/JSON)
┌──────────────▼───────────────────┐
│     BUSINESS LOGIC TIER          │
│     Node.js + Express            │
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
Request → Route → Controller → Service → Repository → Model → Database
                      ↓
                  Response (JSON)
```

---

## 🧩 Design Patterns

| # | Pattern | Áp dụng | Lý do |
|---|---------|---------|-------|
| 1 | **Strategy** | Phương thức thanh toán | Dễ mở rộng thêm cổng thanh toán mới mà không sửa code cũ (Open/Closed) |
| 2 | **State** | Trạng thái Booking | Quản lý chuyển trạng thái hợp lệ, tránh if-else phức tạp |
| 3 | **Observer** | Hệ thống Notification | Tách biệt logic thông báo khỏi nghiệp vụ chính |
| 4 | **Repository** | Tầng truy xuất dữ liệu | Tách query khỏi business logic, dễ thay đổi DB |

---

## 👥 Actors

| Actor | Mô tả |
|-------|-------|
| **Khách hàng (Customer)** | Đăng ký, đặt lịch, thanh toán, xem lịch sử, hủy lịch |
| **Nhân viên (Staff)** | Xem lịch làm việc, xác nhận/hoàn thành booking |
| **Quản trị viên (Admin)** | Quản lý dịch vụ, nhân viên, báo cáo doanh thu |
| **Hệ thống VNPAY** | Xử lý giao dịch thanh toán online |

---

## ⚙️ Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React Native |
| Backend | Node.js + Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Authentication | JWT (JSON Web Token) |
| Payment Gateway | VNPAY |
| API Format | RESTful JSON |

---

## 📁 Cấu trúc thư mục

```
t7/
├── README.md
├── docs/                          # Tài liệu thiết kế
│   ├── architecture.md            # Kiến trúc hệ thống
│   ├── database-design.md         # Thiết kế CSDL
│   ├── design-patterns.md         # Design Patterns
│   └── uml/                       # Các UML Diagrams
│       ├── use-case.md
│       ├── class-diagram.md
│       ├── sequence-diagram.md
│       └── component-diagram.md
│
├── backend/                       # Backend API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js                 # Entry point
│       ├── config/                # Cấu hình (DB, env)
│       ├── models/                # Sequelize Models
│       ├── repositories/          # Repository Pattern
│       ├── services/              # Business Logic
│       ├── controllers/           # Request handlers
│       ├── routes/                # API Routes
│       ├── middlewares/           # Auth, Error handling
│       ├── patterns/              # Design Patterns
│       │   ├── strategy/          # Payment Strategy
│       │   ├── state/             # Booking State Machine
│       │   └── observer/          # Notification Observer
│       └── utils/                 # Helpers, validators
│
└── frontend/                      # React Native App
    ├── package.json
    └── src/
        ├── screens/               # Màn hình
        ├── components/            # Components tái sử dụng
        ├── services/              # API calls
        ├── navigation/            # React Navigation
        └── utils/                 # Helpers
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

### 3. Quy tắc hủy lịch
- Hủy trước **24 giờ** → Hoàn tiền 100%
- Hủy trước **12 giờ** → Hoàn tiền 50%
- Hủy sau **12 giờ** → Không hoàn tiền

### 4. Thanh toán VNPAY
Luồng: Tạo đơn → Tạo URL VNPAY → Redirect → Callback → Cập nhật trạng thái

---

## 🚀 Cài đặt & Chạy

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Cấu hình database trong .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📚 Tài liệu thiết kế

- [Kiến trúc hệ thống](docs/architecture.md)
- [Thiết kế Database](docs/database-design.md)
- [Design Patterns](docs/design-patterns.md)
- [Use Case Diagram](docs/uml/use-case.md)
- [Class Diagram](docs/uml/class-diagram.md)
- [Sequence Diagram](docs/uml/sequence-diagram.md)
- [Component Diagram](docs/uml/component-diagram.md)
