# 🎯 Mezon Auto Clicker & Logger

Chrome Extension tự động chọn đáp án random cho câu hỏi trắc nghiệm trên Mezon.ai và ghi log chi tiết kết quả.

## 📋 Mô tả

Extension này giúp tự động trả lời các câu hỏi trắc nghiệm từ bot KOMU trên Mezon.ai. Khi có câu hỏi mới xuất hiện, extension sẽ:
- Tự động chọn ngẫu nhiên 1 đáp án sau 5-6 giây
- Ghi lại log chi tiết (câu hỏi, đáp án, thời gian)
- Tự động cập nhật kết quả khi KOMU phản hồi (đúng/sai/lỗi)
- Hiển thị tất cả thông tin trong popup extension

## ✨ Tính năng chính

### 🤖 Tự động trả lời
- Phát hiện câu hỏi trắc nghiệm mới từ KOMU
- Random chọn 1 trong các đáp án (1, 2, 3, 4...)
- Delay 5-6 giây để tránh bị detect
- Không click lại câu hỏi đã có kết quả

### 📊 Logging thông minh
- Ghi log mỗi lần click với đầy đủ thông tin:
  - Câu hỏi (ví dụ: [EXCEL], [JAVA], [ENGLISH]...)
  - Đáp án đã chọn
  - Người gửi (KOMU)
  - Thời gian câu hỏi được gửi
  - Thời gian click
  - URL trang

### 🎯 Theo dõi kết quả
Extension tự động phát hiện và cập nhật kết quả:
- ✅ **ĐÚNG** - Hiển thị số điểm hiện tại
- ❌ **SAI** - Hiển thị đáp án đúng
- ⚠️ **LỖI** - Đã trả lời câu hỏi này rồi
- ⏳ **CHỜ KẾT QUẢ** - Đang chờ KOMU phản hồi

### 🎨 Giao diện đẹp
- Popup hiện đại với gradient design
- Status badge với màu sắc trực quan
- Dark mode friendly
- Responsive và mượt mà
- Hiển thị version

### ⚙️ Điều khiển linh hoạt
- **Bật/Tắt**: Toggle on/off dễ dàng
- **Refresh log**: Cập nhật danh sách log
- **Xóa log**: Clear tất cả log đã lưu
- Lưu trạng thái bật/tắt giữa các session

## 🚀 Cài đặt

### Yêu cầu
- Google Chrome hoặc Microsoft Edge
- Tài khoản Mezon.ai

### Các bước cài đặt

1. **Download source code**
   ```bash
   git clone <repository-url>
   cd mezon-auto-clicker
   ```

2. **Load extension vào Chrome**
   - Mở Chrome và truy cập `chrome://extensions/`
   - Bật **Developer mode** (góc trên bên phải)
   - Click **Load unpacked**
   - Chọn thư mục `mezon-auto-clicker`

3. **Xác nhận cài đặt**
   - Icon extension sẽ xuất hiện trên thanh toolbar
   - Extension đã sẵn sàng sử dụng!

## 📖 Hướng dẫn sử dụng

### Bước 1: Truy cập Mezon
- Mở trình duyệt và đăng nhập vào https://mezon.ai
- Vào kênh chat nơi KOMU gửi câu hỏi

### Bước 2: Kích hoạt extension
- Click vào icon extension trên toolbar
- Popup sẽ hiển thị trạng thái hiện tại
- Click nút **▶️ Bật** để kích hoạt

### Bước 3: Để extension làm việc
- Extension sẽ tự động:
  - Phát hiện câu hỏi mới
  - Chờ 5-6 giây
  - Click random một đáp án
  - Ghi log
  - Cập nhật kết quả khi có

### Bước 4: Xem log
- Click icon extension để mở popup
- Xem danh sách tất cả câu hỏi đã trả lời
- Kết quả hiển thị với màu sắc và badge rõ ràng

### Bước 5: Quản lý
- **⏸️ Tắt**: Tạm ngừng auto-click
- **🔄 Refresh**: Cập nhật danh sách log
- **🗑️ Xóa**: Xóa toàn bộ lịch sử

## 🔧 Cách hoạt động

### Cơ chế phát hiện câu hỏi
Extension sử dụng `MutationObserver` để theo dõi DOM và phát hiện khi:
- Có container mới với class `flex flex-row gap-2 py-2`
- Container chứa các button với class `bg-buttonPrimary`
- Container nằm trong message từ KOMU

### Quy trình xử lý
```
1. Phát hiện câu hỏi mới
   ↓
2. Kiểm tra đã có kết quả chưa?
   - Có: Bỏ qua
   - Không: Tiếp tục
   ↓
3. Delay random 5-6 giây
   ↓
4. Click button random
   ↓
5. Lưu log với status "pending"
   ↓
6. Chờ KOMU phản hồi
   ↓
7. Phát hiện kết quả (Correct/Incorrect/Error)
   ↓
8. Cập nhật log với kết quả cuối cùng
```

### Cơ chế phát hiện kết quả
Extension phát hiện các thông báo từ KOMU:
- **"Correct!!!, you have X points"** → Trả lời đúng
- **"Incorrect!!!, The correct answer is X"** → Trả lời sai
- **"Có lỗi xảy ra khi trả lời câu hỏi"** → Lỗi (đã trả lời rồi)

## 📁 Cấu trúc dự án

```
mezon-auto-clicker/
├── manifest.json       # Chrome extension manifest
├── content.js          # Script chạy trên trang Mezon
├── popup.html          # Giao diện popup
├── popup.js            # Logic popup
└── README.md           # Tài liệu này
```

### Chi tiết các file

#### `manifest.json`
- Cấu hình extension (permissions, content scripts, popup)
- Version: 1.0
- Permissions: storage, mezon.ai

#### `content.js` (291 dòng)
- Phát hiện câu hỏi mới bằng MutationObserver
- Tự động click button random
- Ghi log vào Chrome storage
- Phát hiện và cập nhật kết quả
- Xử lý message từ popup

#### `popup.html` (293 dòng)
- Giao diện popup với gradient design
- Status card hiển thị trạng thái
- Button controls (Bật/Tắt, Refresh, Xóa)
- List logs với styling đẹp

#### `popup.js` (181 dòng)
- Giao tiếp với content script
- Render logs từ storage
- Xử lý sự kiện button
- Update UI theo trạng thái

## 🎨 Tính năng UI/UX

### Status Badge
- 🟢 **ĐÚNG**: Background xanh lá + số điểm
- 🔴 **SAI**: Background đỏ + đáp án đúng
- 🟡 **LỖI**: Background vàng + thông báo
- ⚪ **CHỜ**: Background xám + icon loading

### Popup Design
- Header gradient (purple)
- Status card với animation dot
- Buttons với hover effects
- Custom scrollbar
- Responsive layout

## 📊 Dữ liệu được lưu

Extension lưu 2 loại dữ liệu trong Chrome Storage:

### 1. Logs (`mezonAutoClickLogs`)
```javascript
{
  clickedAt: "2025-11-25T10:30:00.000Z",
  url: "https://mezon.ai/chat/...",
  question: "[EXCEL] What is VLOOKUP?",
  answer: "2",
  author: "KOMU",
  questionTimeText: "24/11/2025, 10:29",
  status: "correct",
  points: "965",
  correctAnswer: null,
  errorMessage: null,
  resultReceivedAt: "2025-11-25T10:30:05.000Z"
}
```

### 2. Trạng thái (`mezonAutoClickEnabled`)
```javascript
true // hoặc false
```

## 🔒 Bảo mật & Quyền riêng tư

- Extension chỉ hoạt động trên `mezon.ai/*`
- Không gửi dữ liệu ra ngoài
- Lưu trữ local trong Chrome storage
- Không thu thập thông tin cá nhân
- Open source, có thể review code

## 🐛 Xử lý lỗi

### Nếu extension không hoạt động:
1. Kiểm tra đang ở đúng tab Mezon
2. Reload trang Mezon (F5)
3. Reload extension trong `chrome://extensions/`
4. Kiểm tra Console log (F12)

### Nếu popup báo lỗi:
- **"Vui lòng mở tab Mezon"**: Đang ở tab khác, chuyển sang Mezon
- **"Không kết nối được"**: Content script chưa load, reload trang

## 🚧 Giới hạn

- Chỉ hoạt động trên Mezon.ai
- Chỉ hỗ trợ câu hỏi từ KOMU
- Random đáp án (không phải AI trả lời thông minh)
- Delay cố định 5-6 giây

## 📝 Version History

### v1.0 (Current)
- ✨ Tự động click random đáp án
- 📊 Logging chi tiết với đầy đủ thông tin
- 🎯 Tự động phát hiện và cập nhật kết quả (Correct/Incorrect/Error)
- 🎨 Popup UI đẹp với gradient design
- ⚙️ Toggle bật/tắt + quản lý log
- 🚫 Tránh click lại câu hỏi đã có kết quả
- 📱 Status badge với màu sắc trực quan
- 💾 Lưu trạng thái giữa các session

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## ⚠️ Disclaimer

Extension này được tạo ra cho mục đích học tập và giải trí. Người dùng tự chịu trách nhiệm khi sử dụng. Không khuyến khích sử dụng để gian lận trong các kỳ thi hoặc đánh giá chính thức.

## 📧 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng:
- Mở Issue trên GitHub
- Hoặc liên hệ qua email

## 📄 License

[MIT License](LICENSE) - Tự do sử dụng và chỉnh sửa.

---

**Made with ❤️ for Mezon users**

