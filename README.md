# 🏋️‍♂️ GYMPRO - Hệ Thống Quản Lý Phòng Tập Gym & Fitness

Chào mừng đến với **Gympro**, hệ thống quản lý phòng tập Gym và Fitness toàn diện. Đây là dự án thuộc môn học **ITSS** (Information Technology System Seminar/Project) nhằm giải quyết bài toán vận hành, đặt lịch, quản lý hội viên, huấn luyện viên (PT), nhân viên và cơ sở vật chất của phòng tập một cách tối ưu.

Dự án được phát triển theo mô hình **Monorepo** chia làm 2 phần chính:
*   [frontend](file:///d:/ITSS/frontend) - Ứng dụng Client & Dashboard quản trị bằng **Next.js (App Router)**.
*   [backend](file:///d:/ITSS/backend) - API Service bằng **NestJS** sử dụng **PostgreSQL** & **TypeORM**.

---

## 🗺️ Bản đồ Vai trò trong Hệ thống (Roles)

Hệ thống được thiết kế phân quyền chặt chẽ với 4 vai trò chính thông qua enum `user_role`:

| Mã vai trò | Tên vai trò | Phạm vi chức năng chính |
| :--- | :--- | :--- |
| **`AD`** | **Admin (Quản trị viên)** | Quản lý toàn bộ hệ thống, cấu hình gói tập, xem báo cáo doanh thu, quản lý tài khoản nhân sự. |
| **`NV`** | **Staff (Nhân viên)** | Thực hiện check-in cho hội viên, bán gói tập tại quầy, tiếp nhận phản hồi, kiểm tra thiết bị phòng tập. |
| **`PT`** | **Personal Trainer (HLV Cá nhân)** | Quản lý lịch dạy, thiết lập lộ trình tập luyện/dinh dưỡng, chấm điểm/đánh giá hội viên, theo dõi chỉ số. |
| **`HV`** | **Member (Hội viên)** | Đăng ký gói tập, mua voucher, xem lịch học, đặt lịch tập với PT, theo dõi chỉ số cơ thể, gửi phản hồi. |

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### 💻 Frontend
*   **Framework:** Next.js 16 (App Router)
*   **Ngôn ngữ:** TypeScript
*   **Styling:** Tailwind CSS v4, PostCSS
*   **UI Components:** Radix UI (Accordion, Dialog, Tabs, Tooltip,...), Lucide React (Icons)
*   **Hiệu ứng:** Motion (Framer Motion)
*   **Biểu đồ:** Recharts
*   **Quản lý Form:** React Hook Form
*   **Thông báo:** Sonner

### ⚙️ Backend
*   **Framework:** NestJS 11
*   **Ngôn ngữ:** TypeScript
*   **Database ORM:** TypeORM (kết nối PostgreSQL)
*   **Bảo mật & Xác thực:** Passport JWT, Bcrypt (Mã hóa mật khẩu)
*   **Kiểm thử:** Jest, Supertest
*   **Tài liệu API:** Swagger UI (OpenAPI)

---

## 📂 Cấu trúc Thư mục Dự án

```text
ITSS/
├── backend/                  # NestJS Backend API
│   ├── src/                  # Mã nguồn chính của API
│   │   ├── admin/            # Nghiệp vụ quản trị viên
│   │   ├── auth/             # Hệ thống đăng nhập, đăng ký, JWT
│   │   ├── users/            # Quản lý thông tin người dùng chung
│   │   ├── customers/        # Nghiệp vụ khách hàng / hội viên
│   │   ├── trainers/         # Nghiệp vụ huấn luyện viên (PT)
│   │   ├── staffs/           # Nghiệp vụ nhân viên phòng gym
│   │   ├── memberships/      # Đăng ký và quản lý gói tập
│   │   ├── bookings/         # Đặt lịch tập với PT
│   │   ├── body-records/     # Theo dõi chỉ số cơ thể
│   │   ├── checkins/         # Lịch sử ra vào phòng tập
│   │   ├── facilities/       # Quản lý phòng và thiết bị phòng gym
│   │   ├── work-shifts/      # Quản lý ca trực nhân sự
│   │   ├── payments/         # Giao dịch hóa đơn thanh toán
│   │   └── main.ts           # Điểm khởi chạy backend (cổng 3001)
│   ├── backup.sql            # Bản sao lưu cấu trúc & dữ liệu PostgreSQL mẫu
│   └── package.json          # Danh sách thư viện backend
│
└── frontend/                 # Next.js Client & Dashboard App
    ├── app/                  # Thư mục App Router
    │   ├── admins/           # Giao diện dashboard Quản trị viên
    │   │   └── _views/       # Các trang quản trị (Schedule, Member, v.v...)
    │   ├── staffs/           # Giao diện làm việc của nhân viên
    │   ├── PT/               # Giao diện dành cho PT
    │   ├── members/          # Giao diện dành cho Hội viên
    │   ├── login/            # Trang đăng nhập
    │   └── register/         # Trang đăng ký thành viên
    └── package.json          # Danh sách thư viện frontend
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Yêu cầu Hệ thống
*   **Node.js:** Phiên bản 18.x trở lên
*   **PostgreSQL:** Phiên bản 14.x trở lên (đang chạy cổng mặc định `5432`)

### 2. Thiết lập Cơ sở dữ liệu (Database Setup)
1.  Khởi tạo một database trống trên PostgreSQL với tên là `Gympro`.
2.  Import cấu trúc bảng và dữ liệu từ file sao lưu [backup.sql](file:///d:/ITSS/backend/backup.sql) hoặc file SQL trích xuất [Gympro_extracted_text.txt](file:///d:/ITSS/backend/Gympro_extracted_text.txt).
    *   *Sử dụng công cụ pgAdmin, DBeaver hoặc chạy lệnh terminal:*
    ```bash
    psql -U postgres -d Gympro -f backend/backup.sql
    ```

### 3. Khởi động Backend (Port 3001)
1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các thư viện cần thiết:
    ```bash
    npm install
    ```
3.  Cấu hình file môi trường `.env` (Nếu chưa có, hãy tạo file [backend/.env](file:///d:/ITSS/backend/.env) với nội dung):
    ```env
    DB_HOST=your_database_host
    DB_PORT=your_database_port
    DB_USERNAME=your_database_username
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRATION=your_jwt_expiration_time
    ```
4.  Chạy Backend ở chế độ phát triển:
    ```bash
    npm run start:dev
    ```
5.  Truy cập tài liệu API tự động (Swagger): [http://localhost:3001/api](http://localhost:3001/api)

### 4. Khởi động Frontend (Port 3000)
1.  Di chuyển vào thư mục frontend:
    ```bash
    cd ../frontend
    ```
2.  Cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Chạy Frontend ở chế độ phát triển:
    ```bash
    npm run dev
    ```
4.  Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Tài khoản đăng nhập
Sử dụng các tài khoản quản trị viên, huấn luyện viên (PT), nhân viên và hội viên đã được khởi tạo trong cơ sở dữ liệu của bạn để đăng nhập hệ thống.

*   **Tài khoản quản trị / Nhân sự / PT**: Đăng nhập bằng Email và mật khẩu tương ứng được khởi tạo trong database.
*   **Tài khoản Hội viên**: Đăng nhập bằng Số điện thoại/Email và mật khẩu hội viên đã đăng ký.

