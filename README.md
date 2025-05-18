# Milk-Store-App

Ứng dụng bán sữa và các sản phẩm liên quan, được xây dựng với React Native và Expo.

## Phiên bản mới

Chúng tôi vừa cập nhật ứng dụng với nhiều cải tiến quan trọng:

### 1. Hệ thống Responsive

- **Responsive Framework**: Thêm hệ thống responsive hoàn chỉnh trong thư mục `styles/`
- **Breakpoints**: Hỗ trợ các kích thước màn hình khác nhau (xs, sm, md, lg, xl)
- **Utility Functions**: Cung cấp các hàm `scale()`, `verticalScale()`, `normalize()` để tính toán kích thước theo tỷ lệ

### 2. Cải tiến UI/UX

- **Header**: Đã sửa lỗi hiển thị header bị khuất trên các thiết bị
- **Components**: Tách các component riêng để tái sử dụng (Header, Footer, CarouselBanner, ProductCard)
- **Status Bar**: Điều chỉnh status bar tự động theo theme sáng/tối
- **Layout System**: Thêm MainLayout để đảm bảo các trang có giao diện nhất quán

### 3. Tối ưu hóa code

- **Tách components**: Giảm lượng code trùng lặp
- **Cấu trúc rõ ràng**: Mỗi component có một nhiệm vụ cụ thể
- **TypeScript**: Cải thiện type safety cho toàn bộ dự án
- **Clean Architecture**: Tách biệt UI, business logic và data access

## Cách sử dụng

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npx expo start
```

3. Chạy trên thiết bị thực hoặc máy ảo:
```bash
npx expo start --android
# hoặc
npx expo start --ios
```

## Tính năng chính

- Hiển thị danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm
- Giỏ hàng và thanh toán
- Quản lý tài khoản người dùng
- Giao diện responsive trên mọi thiết bị

## Xem thêm thông tin

Để biết thêm thông tin về các cải tiến kỹ thuật, vui lòng đọc file [OPTIMIZATION.md](./OPTIMIZATION.md).
