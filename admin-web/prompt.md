Bối cảnh:
- Dự án là hệ thống cứu hộ khẩn cấp, Monorepo có sẵn folder admin-web/ (React/Vite)
- Đã có firebase.config.js chứa Firebase project credentials
- Cần tạo thêm folder functions/ ngang hàng với admin-web/

Yêu cầu:
Hãy hướng dẫn và tạo cấu trúc thư mục đầy đủ cho Firebase Cloud Functions với các yêu cầu sau:

1. Khởi tạo Firebase CLI trong root monorepo, bật các services:
   Firestore, Functions (JavaScript), Storage, Emulators
   (Auth, Functions, Firestore, Realtime Database, Storage)

2. Tạo cấu trúc thư mục functions/src/ theo các nhóm:
   - sos/        (chứa các trigger liên quan SOS)
   - notify/     (chứa logic gửi thông báo FCM)
   - ai/         (chứa logic tính toán AI Triage)
   - api/        (chứa REST API endpoints)

3. Khởi tạo Firebase Admin SDK trong functions/src/index.js:
   - Gọi initializeApp() một lần duy nhất ở đầu file
   - Export tất cả functions từ các sub-modules
   - Không hardcode credentials, dùng Application Default Credentials

4. Cấu hình package.json cho functions/:
   - Node.js version 18
   - engines field đúng chuẩn Firebase
   - Các dependencies: firebase-admin, firebase-functions

5. Cấu hình firebase.json ở root:
   - Trỏ đúng source functions vào folder functions/
   - Cấu hình emulators với ports cụ thể không conflict với Vite (5173)
   - predeploy script chạy lint trước khi deploy

Lưu ý quan trọng:
- Dùng Firebase Functions v2 (firebase-functions/v2), không dùng v1
- Region mặc định set là asia-southeast1 cho tất cả functions
- Không viết business logic trong index.js, chỉ import và export