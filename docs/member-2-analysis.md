# 📘 Tài liệu Phân Tích Chuyên Sâu cho Thành viên 2 (Nguyễn Sỹ Kim Bằng)

Chào bạn, đây là tài liệu hướng dẫn chi tiết về 2 Design Patterns quan trọng nhất trong việc xử lý logic nghiệp vụ mà bạn phụ trách: **Strategy Pattern** và **State Pattern**.

---

## 1. STRATEGY PATTERN (Chiến lược)

### 📌 Tại sao cần sử dụng?
Trong BookingPro, chúng ta có nhiều cách để khách hàng thanh toán (VNPay, COD, và tương lai có thể là MoMo, Chuyển khoản). 

**Vấn đề:** Nếu không dùng Strategy, code trong `PaymentService` sẽ đầy các câu lệnh `if-else`:
```javascript
if (method === 'vnpay') { /* logic VNPay 50 dòng */ }
else if (method === 'cod') { /* logic COD 10 dòng */ }
else if (method === 'momo') { /* logic MoMo... */ }
```
Cách viết này vi phạm nguyên tắc **Open/Closed (OCP)**: Mỗi khi thêm 1 cổng thanh toán, bạn buộc phải sửa file Service cũ, dẫn đến rủi ro làm hỏng code đang chạy ổn định.

### ⚙️ Cách hoạt động trong dự án
- **PaymentStrategy (Interface):** Định nghĩa khung chung cho mọi loại thanh toán.
- **VNPayStrategy / CODStrategy:** "Cụ thể hóa" cách thanh toán đó hoạt động.
- **PaymentContext:** Đóng vai trò là bộ não điều khiển. Nó không quan tâm bạn dùng loại gì, nó chỉ gọi lệnh `executePayment()`.

### 📊 So sánh
| Tiêu chí | Dùng If-Else (Cũ) | Dùng Strategy (Hiện tại) |
|:---|:---|:---|
| **Độ phức tạp** | Dễ viết lúc đầu, phình to về sau. | Cần cài đặt nhiều file lúc đầu, nhưng cực sạch. |
| **Bảo trì** | Sửa 1 chỗ ảnh hưởng toàn bộ Service. | Thêm cổng mới chỉ cần tạo file mới, 0% rủi ro code cũ. |
| **Testing** | Phải test lại toàn bộ Service. | Chỉ cần viết Unit Test cho đúng class Strategy mới. |

---

## 2. STATE PATTERN (Trạng thái)

### 📌 Tại sao cần sử dụng?
Lịch đặt (Booking) là "trái tim" của hệ thống và nó có vòng đời cực kỳ rắc rối:
`Draft` ➔ `Pending` ➔ `Confirmed` ➔ `Completed` hoặc `Cancelled`.

**Vấn đề:** Ở trạng thái `Completed`, khách không được phép `Cancel`. Ở trạng thái `Cancelled`, nhân viên không được phép `Confirm`. 
Nếu dùng các biến cờ (flags) như `isCancelled`, `isConfirmed`, logic kiểm tra sẽ cực kỳ rối rắm và dễ sai sót.

### ⚙️ Cách hoạt động trong dự án
Chúng ta biến mỗi trạng thái thành một **đối tượng thông minh**.
- Thay vì hỏi: `if (booking.status === 'confirmed')`, chúng ta chỉ ra lệnh: `bookingContext.cancel()`.
- Nếu Booking đang ở `ConfirmedState`, nó sẽ thực hiện hủy thành công.
- Nếu Booking đang ở `CompletedState`, nó sẽ tự động báo lỗi: *"Hành động không hợp lệ"*.

### 📊 So sánh
| Tiêu chí | Dùng Switch-Case / Flags | Dùng State Pattern |
|:---|:---|:---|
| **Kiểm soát quy tắc** | Phải viết code check điều kiện ở mọi nơi. | Quy tắc được đóng gói ngay trong class của trạng thái đó. |
| **Khả năng mở rộng** | Thêm trạng thái mới là "cơn ác mộng" sửa code. | Chỉ cần tạo thêm 1 file file `NewState.js`. |
| **Tính an toàn** | Dễ bị quên check dẫn đến lỗi logic (ví dụ: Hủy lịch đã hoàn thành). | Tự động bảo vệ (Encapsulation), không thể thực hiện sai quy trình. |

---

## 3. MỐI LIÊN KẾT GIỮA 2 PATTERN (Nhiệm vụ của bạn)

Là người quản lý logic nghiệp vụ, bạn sẽ thường xuyên làm việc tại điểm giao thoa của 2 pattern này:

1. **Khởi tạo:** Khách chọn Thanh toán (dùng **Strategy**).
2. **Xử lý:** Chờ kết quả từ cổng thanh toán.
3. **Chuyển đổi:** Khi thanh toán thành công, bạn gọi sang **State Pattern** để chuyển Booking từ `Draft/Pending` sang `Confirmed`.

---

## 4. LUỒNG XỬ LÝ CHI TIẾT (Ví dụ: Thanh toán VNPay)

Đây là sơ đồ "đường đi" của dữ liệu qua các pattern bạn quản lý:

### Bước 1: Khởi tạo thanh toán (Strategy Pattern)
- **`PaymentController.js`** gọi `PaymentService.initiatePayment()`.
- **`PaymentService.js`** lấy class **`VNPayStrategy.js`** ra dựa trên lựa chọn của khách.
- Service đẩy strategy này vào **`PaymentContext.js`**.
- Context gọi `executePayment()` ➔ Kết quả: Trả về link VNPay cho khách.

### Bước 2: Xác nhận kết quả
- Khi khách trả tiền xong, VNPay gọi về link callback.
- **`PaymentService.js`** dùng **`VNPayStrategy.js`** để kiểm tra mã bảo mật xem dữ liệu có đúng không.

### Bước 3: Cập nhật trạng thái (State Pattern)
- Nếu hợp lệ, **`PaymentService.js`** tạo một **`BookingContext.js`**.
- Nó gọi lệnh: `await bookingContext.confirm()`.
- Lớp tương ứng trong **`booking.states.js`** sẽ chạy và gọi Repository để lưu vào Database là `status: 'confirmed'`.

### Bước 4: Thông báo tự động (Observer Pattern)
- Cuối cùng, **`PaymentService.js`** gọi `this.notify('payment_success', data)`.
- Hệ thống kích hoạt **`NotificationObserver.js`** để báo cho khách qua App.
- **`LoggingObserver.js`** sẽ in log ra console để bạn theo theo dõi.

### 💡 Lời khuyên cho bạn:
- Khi có yêu cầu thêm tính năng "Hoàn tiền": Hãy nghĩ xem trạng thái nào được phép hoàn tiền (thêm logic vào `BookingState`) và cổng thanh toán nào hỗ trợ hoàn tiền (thêm logic vào `PaymentStrategy`).
- Luôn kiểm tra file `booking.states.js` trước khi thay đổi bất kỳ logic chuyển trạng thái nào trong Service.

---
*Tài liệu này được soạn riêng để hỗ trợ Nguyễn Sỹ Kim Bằng trong việc làm chủ logic cốt lõi của hệ thống.*
