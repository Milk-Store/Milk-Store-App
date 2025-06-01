# Milk-Store-App

<div align="center">
  <h3>Ứng dụng quản lý và bán sữa trên nền tảng di động</h3>
  <p>Xây dựng với React Native, Expo và TypeScript</p>
</div>

## 📝 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Thiết lập môi trường](#thiết-lập-môi-trường)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Triển khai](#triển-khai)
- [Tài liệu API](#tài-liệu-api)
- [Đóng góp](#đóng-góp)
- [License](#license)

## 🎯 Tổng quan

Milk-Store-App là ứng dụng di động phục vụ việc quản lý và bán sữa, được thiết kế với giao diện người dùng thân thiện và tối ưu hóa trải nghiệm người dùng. Ứng dụng hỗ trợ đầy đủ các tính năng từ quản lý sản phẩm, đơn hàng đến thống kê doanh thu.

## ✨ Tính năng

### 👥 Người dùng
- **Quản lý tài khoản**
  - Đăng nhập tài khoản admin
  - Cập nhật thông tin cá nhân

- **Mua sắm**
  - Xem danh sách sản phẩm theo danh mục
  - Tìm kiếm và lọc sản phẩm
  - Xem chi tiết sản phẩm
  - Thêm vào giỏ hàng
  - Đặt hàng

### 👨‍💼 Quản trị viên
- **Quản lý sản phẩm**
  - Thêm, sửa, xóa sản phẩm
  - Upload hình ảnh sản phẩm
  - Quản lý danh mục

- **Quản lý đơn hàng**
  - Xem danh sách đơn hàng
  - Cập nhật trạng thái đơn hàng
  - Thông báo realtime khi có đơn hàng mới

- **Thống kê và báo cáo**
  - Thống kê doanh thu theo ngày/tháng/năm
  - Theo dõi số lượng đơn hàng
  - Báo cáo sản phẩm bán chạy

### 🎨 Giao diện
- Thiết kế responsive
- Hỗ trợ chế độ tối (Dark mode)
- Đa ngôn ngữ (Tiếng Việt)
- Animations và transitions mượt mà

## 💻 Yêu cầu hệ thống

- Node.js 16.0 trở lên
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android development)
- Xcode (cho iOS development, chỉ trên macOS)
- Git

## 🔧 Thiết lập môi trường

### 1. Tài khoản Expo
1. Đăng ký tài khoản tại [Expo.dev](https://expo.dev)
2. Cài đặt Expo CLI:
\`\`\`bash
npm install -g expo-cli
\`\`\`
3. Đăng nhập Expo CLI:
\`\`\`bash
expo login
\`\`\`

### 2. Thiết lập EAS
1. Cài đặt EAS CLI:
\`\`\`bash
npm install -g eas-cli
\`\`\`
2. Đăng nhập EAS:
\`\`\`bash
eas login
\`\`\`

## 🚀 Cài đặt

1. Clone repository:
\`\`\`bash
git clone https://github.com/your-username/milk-store-app.git
cd milk-store-app
\`\`\`

2. Cài đặt dependencies:
\`\`\`bash
npm install
\`\`\`

3. Cập nhật Project ID:
- Mở file `app.json`
- Thay thế `projectId` bằng ID từ tài khoản Expo của bạn
- Cập nhật các thông tin khác như `name`, `slug`, `version`

4. Khởi động ứng dụng cho development:
\`\`\`bash
npx expo start
\`\`\`

## ⚙️ Cấu hình

1. Tạo file .env từ .env.example:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Cập nhật các biến môi trường trong .env:
\`\`\`
API_URL=your_api_url
UPLOAD_URL=your_upload_url
\`\`\`

3. Cấu hình Push Notifications:
- Tạo project trên Firebase Console
- Thêm file google-services.json vào thư mục android/app
- Cập nhật projectId trong app.json:
\`\`\`json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
\`\`\`

## 📦 Triển khai

### Cấu hình EAS
1. Khởi tạo cấu hình EAS:
\`\`\`bash
eas init
\`\`\`

2. Tạo file eas.json với các profile build:
\`\`\`json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
\`\`\`

### Android
1. Tạo keystore:
\`\`\`bash
keytool -genkey -v -keystore milk-store.keystore -alias milk-store -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

2. Thêm keystore vào android/app:
- Copy file milk-store.keystore vào android/app
- Cập nhật gradle.properties với thông tin keystore

3. Build APK Development:
\`\`\`bash
eas build -p android --profile preview
\`\`\`

4. Build APK Production:
\`\`\`bash
eas build -p android --profile production
\`\`\`

### iOS
1. Đăng ký Apple Developer Account
2. Cấu hình certificates và provisioning profiles:
\`\`\`bash
eas credentials
\`\`\`

3. Build Development:
\`\`\`bash
eas build -p ios --profile preview
\`\`\`

4. Build Production:
\`\`\`bash
eas build -p ios --profile production
\`\`\`

### Submit to Stores
1. Android (Google Play):
\`\`\`bash
eas submit -p android
\`\`\`

2. iOS (App Store):
\`\`\`bash
eas submit -p ios
\`\`\`

## 📚 Tài liệu API

API documentation có thể được tìm thấy trong thư mục [docs/api](docs/api).

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

## 📄 License

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Tác giả

- **Tên tác giả** - *Initial work* - [GitHub Profile](https://github.com/username)

## 🙏 Cảm ơn

- Cảm ơn cộng đồng React Native và Expo
- Cảm ơn các contributor đã đóng góp cho dự án
