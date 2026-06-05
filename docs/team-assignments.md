# 📋 Phân Chia Nhiệm Vụ Phát Triển Design Patterns

Tài liệu này phân chia trách nhiệm quản lý và phát triển 6 loại Design Patterns chính trong hệ thống BookingPro cho nhóm gồm 3 thành viên. Mỗi thành viên sẽ phụ trách **2 loại patterns** có tính liên kết chặt chẽ với nhau.

---

## 🏗️ Thành viên 1: Nền tảng & Dữ liệu (Foundation & Data)

**Trách nhiệm chính:** Đảm bảo hệ thống khởi tạo đúng cách và dữ liệu được truy xuất an toàn.

| Pattern | Nhiệm vụ cụ thể |
|:---|:---|
| **1. Singleton** | - Quản lý kết nối Database (Sequelize instance).<br>- Đảm bảo các Service và Repository được xuất ra dưới dạng instance duy nhất.<br>- Kiểm soát việc config các biến môi trường (.env) cho toàn hệ thống. |
| **2. Repository** | - Duy trì và mở rộng `BaseRepository`.<br>- Triển khai các phương thức truy vấn dữ liệu phức tạp (ví dụ: tìm slot trống, thống kê doanh thu).<br>- Đảm bảo tầng Service không bao giờ gọi trực tiếp tới Sequelize Model. |

---

## ⚡ Thành viên 2(Nguyễn Sỹ Kim Bằng): Nghiệp vụ & Luồng xử lý (Business Logic & Workflow)

**Trách nhiệm chính:** Xử lý các quy tắc nghiệp vụ phức tạp và các luồng thanh toán đa dạng.

| Pattern | Nhiệm vụ cụ thể |
|:---|:---|
| **3. Strategy** | - Quản lý và tích hợp thêm các cổng thanh toán mới (ví dụ: MoMo, ZaloPay).<br>- Bảo trì class `PaymentContext` và các Strategy hiện có (VNPay, COD).<br>- Xử lý logic checksum và bảo mật thông tin thanh toán. |
| **4. State** | - Quản lý vòng đời của Booking (Draft -> Pending -> Confirmed...).<br>- Mở rộng thêm các trạng thái mới nếu cần (ví dụ: InProgress, Refunded).<br>- Đảm bảo các hành động (Confirm, Cancel) chỉ được thực hiện khi trạng thái hợp lệ. |

---

## 📢 Thành viên 3: Giao tiếp & Cấu trúc (Communication & Architecture)

**Trách nhiệm chính:** Đảm bảo tính nhất quán của toàn bộ kiến trúc và hệ thống thông báo/ghi log.

| Pattern | Nhiệm vụ cụ thể |
|:---|:---|
| **5. Observer** | - Quản lý hệ thống thông báo (Notification) và ghi nhật ký (Logging).<br>- Triển khai các Observer mới (ví dụ: SMSObserver, EmailObserver).<br>- Đảm bảo các sự kiện được bắn ra đúng lúc và đúng đối tượng nhận. |
| **6. Layered Arch.** | - Giám sát tính nhất quán của kiến trúc 4 tầng (Controller -> Service -> Repo -> Model).<br>- Refactor các đoạn code vi phạm ranh giới giữa các tầng.<br>- Phụ trách cấu trúc Router và Middleware (xác thực, phân quyền). |

---

## 🤝 Quy trình phối hợp

1. **Khi thêm một Model mới:**
   - **Thành viên 1** tạo Model và Repository.
   - **Thành viên 3** tạo Controller, Service tương ứng và thiết lập Router.
2. **Khi thêm một hành động nghiệp vụ (ví dụ: Hoàn tiền):**
   - **Thành viên 2** triển khai logic trạng thái (State) và logic thanh toán (Strategy).
   - **Thành viên 3** thêm Observer để thông báo cho khách hàng khi hoàn tiền thành công.
3. **Kiểm tra chéo (Code Review):**
   - Mọi thay đổi liên quan đến cấu trúc file phải được cả 3 thành viên thống nhất để không phá vỡ **Layered Architecture**.
