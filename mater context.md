MASTER CONTEXT (PHIÊN BẢN CHUẨN HÓA)

Đây là phiên bản mình đề xuất dùng cho Antigravity.

1. Thông tin dự án

Tên hệ thống:

BookingPro

Loại hệ thống:

Hệ thống đặt lịch dịch vụ trực tuyến

Đối tượng sử dụng:

Customer
Staff
Admin

2. Mục tiêu hệ thống

Cho phép:

Quản lý dịch vụ
Quản lý nhân viên
Đặt lịch
Thanh toán
Quản lý booking
Thông báo
Báo cáo doanh thu

3. Kiến trúc tổng thể

Kiến trúc:

3-Tier Architecture

gồm:

Presentation Tier

React Native + Expo

Business Logic Tier

NodeJS + Express

Data Tier

MySQL + Sequelize




4. Kiến trúc Backend

Mô hình:

MVC + Layered Architecture
Controller
↓
Service
↓
Repository
↓
Model




5. Core Domain

Thực thể trung tâm:

Booking

Liên kết với:

User
Service
Payment
Notification

6. Các Use Case trọng tâm
UC05

Đặt lịch

UC06

Thanh toán

UC08

Hủy lịch

UC11

Xác nhận booking

UC12

Hoàn thành booking

UC20

Tự động hủy booking





7. Thiết kế CSDL

7 bảng chính:

users
categories
services
staff_schedules
bookings
payments
notifications

8. Design Patterns được áp dụng
Singleton

Mục tiêu:

Một instance duy nhất cho:
Database
Services
Repositories

Strategy

Bài toán:

Nhiều phương thức thanh toán.

Hiện thực:

PaymentStrategy
VNPayStrategy
CODStrategy
PaymentContext

State

Bài toán:

Quản lý vòng đời booking.

Trạng thái:

Draft
Pending
Confirmed
Completed
Cancelled

Observer

Bài toán:

Thông báo và ghi log khi sự kiện xảy ra.

Observer:

NotificationObserver
LoggingObserver

Repository

Bài toán:

Tách truy cập dữ liệu khỏi nghiệp vụ.

Hiện thực:

BaseRepository
UserRepository
BookingRepository
PaymentRepository
...

Layered Architecture

Mục tiêu:

Tách biệt:

Controller
Service
Repository
Model

9. Chất lượng thiết kế

Áp dụng:

SRP

Controller, Service, Repository tách trách nhiệm.

OCP

Strategy, State, Observer.

DIP

Service phụ thuộc Repository.

10. Khả năng mở rộng

Có thể bổ sung:

MoMo
ZaloPay
EmailObserver
SMSObserver
InProgressState

mà không sửa kiến trúc lõi.