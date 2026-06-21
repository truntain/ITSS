-- ==========================================
-- 1. KHỞI TẠO CÁC KIỂU ENUM
-- ==========================================
CREATE TYPE user_role AS ENUM ('HV', 'PT', 'NV', 'AD');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('none', 'checked_in', 'absent');
CREATE TYPE equipment_status AS ENUM ('active', 'maintenance', 'broken');
CREATE TYPE report_status AS ENUM ('pending', 'in_progress', 'resolved');
CREATE TYPE feedback_status AS ENUM ('pending', 'responded');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'paused');
CREATE TYPE voucher_discount_type AS ENUM ('percent', 'fixed');
CREATE TYPE voucher_status AS ENUM ('active', 'expired', 'depleted');
CREATE TYPE user_status AS ENUM ('working', 'leave', 'quit');
CREATE TYPE equipment_category AS ENUM ('Cardio', 'Strength', 'Classroom', 'Others');

-- ==========================================
-- 2. KHỞI TẠO CÁC SEQUENCE VÀ BẢNG DỮ LIỆU
-- ==========================================

-- Bảng users
CREATE SEQUENCE public.users_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.users (
    id integer DEFAULT nextval('public.users_id_seq'::regclass) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(10) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(15) NOT NULL,
    birth_date date,
    gender character varying(10),
    height numeric(5,2),
    avatar character varying(255),
    is_active boolean DEFAULT true,
    status character varying(50) DEFAULT 'working'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['HV'::character varying, 'PT'::character varying, 'NV'::character varying, 'AD'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK ((status::text = ANY (ARRAY['working'::text, 'leave'::text, 'quit'::text])))
);

-- Bảng announcements
CREATE SEQUENCE public.announcements_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.announcements (
    id integer DEFAULT nextval('public.announcements_id_seq'::regclass) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT announcements_pkey PRIMARY KEY (id),
    CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES public.users(id)
);

-- Bảng body_records
CREATE SEQUENCE public.body_records_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.body_records (
    id integer DEFAULT nextval('public.body_records_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    pt_id integer,
    weight numeric(5,2) NOT NULL,
    body_fat numeric(4,2) NOT NULL,
    muscle_mass numeric(4,2),
    recorded_date date NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT body_records_pkey PRIMARY KEY (id),
    CONSTRAINT fk_body_pt FOREIGN KEY (pt_id) REFERENCES public.users(id),
    CONSTRAINT fk_body_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng bookings
CREATE SEQUENCE public.bookings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.bookings (
    id integer DEFAULT nextval('public.bookings_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    pt_id integer NOT NULL,
    date date NOT NULL,
    time_slot character varying(50) NOT NULL,
    room character varying(100),
    type character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    attendance_status character varying(20) DEFAULT 'none'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    CONSTRAINT bookings_attendance_status_check CHECK (((attendance_status)::text = ANY ((ARRAY['none'::character varying, 'checked_in'::character varying, 'absent'::character varying])::text[]))),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT fk_booking_pt FOREIGN KEY (pt_id) REFERENCES public.users(id),
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng checkins
CREATE SEQUENCE public.checkins_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.checkins (
    id integer DEFAULT nextval('public.checkins_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    checked_in_at timestamp without time zone DEFAULT now(),
    checked_in_by integer,
    checkin_method character varying(50) DEFAULT 'QR_member'::character varying,
    CONSTRAINT checkins_pkey PRIMARY KEY (id),
    CONSTRAINT fk_checkin_staff FOREIGN KEY (checked_in_by) REFERENCES public.users(id),
    CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng facilities
CREATE SEQUENCE public.facilities_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.facilities (
    id integer DEFAULT nextval('public.facilities_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    capacity integer NOT NULL,
    description text,
    address text,
    phone character varying(20),
    email character varying(255),
    open_time character varying(10),
    close_time character varying(10),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT facilities_pkey PRIMARY KEY (id)
);

-- Bảng equipment
CREATE SEQUENCE public.equipment_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.equipment (
    id integer DEFAULT nextval('public.equipment_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    facility_id integer NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    category equipment_category NOT NULL DEFAULT 'Others',
    last_maintenance date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT equipment_pkey PRIMARY KEY (id),
    CONSTRAINT equipment_code_key UNIQUE (code),
    CONSTRAINT equipment_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'maintenance'::character varying, 'broken'::character varying])::text[]))),
    CONSTRAINT fk_equipment_facility FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE
);

-- Bảng equipment_reports
CREATE SEQUENCE public.equipment_reports_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.equipment_reports (
    id integer DEFAULT nextval('public.equipment_reports_id_seq'::regclass) NOT NULL,
    equipment_id integer NOT NULL,
    reporter_id integer NOT NULL,
    description text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    reported_at timestamp without time zone DEFAULT now(),
    resolved_at timestamp without time zone,
    CONSTRAINT equipment_reports_pkey PRIMARY KEY (id),
    CONSTRAINT equipment_reports_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying])::text[]))),
    CONSTRAINT fk_report_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE,
    CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES public.users(id)
);

-- Bảng feedbacks
CREATE SEQUENCE public.feedbacks_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.feedbacks (
    id integer DEFAULT nextval('public.feedbacks_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    reply_content text,
    replier_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    replied_at timestamp without time zone,
    CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
    CONSTRAINT feedbacks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'responded'::character varying])::text[]))),
    CONSTRAINT fk_feedback_replier FOREIGN KEY (replier_id) REFERENCES public.users(id),
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng packages
CREATE TABLE public.packages (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    duration_months integer NOT NULL,
    price numeric(12,2) NOT NULL,
    benefits jsonb NOT NULL,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT packages_pkey PRIMARY KEY (id)
);

-- Bảng memberships
CREATE SEQUENCE public.memberships_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.memberships (
    id integer DEFAULT nextval('public.memberships_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    package_id character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_sessions integer DEFAULT 0,
    remaining_sessions integer DEFAULT 0,
    voucher_code character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT memberships_pkey PRIMARY KEY (id),
    CONSTRAINT memberships_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'paused'::character varying])::text[]))),
    CONSTRAINT fk_membership_package FOREIGN KEY (package_id) REFERENCES public.packages(id),
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng pt_evaluations
CREATE SEQUENCE public.pt_evaluations_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.pt_evaluations (
    id integer DEFAULT nextval('public.pt_evaluations_id_seq'::regclass) NOT NULL,
    pt_id integer NOT NULL,
    trainee_id integer NOT NULL,
    score integer NOT NULL,
    content text NOT NULL,
    evaluation_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT pt_evaluations_pkey PRIMARY KEY (id),
    CONSTRAINT pt_evaluations_score_check CHECK (((score >= 1) AND (score <= 10))),
    CONSTRAINT fk_evaluation_pt FOREIGN KEY (pt_id) REFERENCES public.users(id),
    CONSTRAINT fk_evaluation_trainee FOREIGN KEY (trainee_id) REFERENCES public.users(id)
);

-- Bảng pt_ratings
CREATE SEQUENCE public.pt_ratings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.pt_ratings (
    id integer DEFAULT nextval('public.pt_ratings_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    pt_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT pt_ratings_pkey PRIMARY KEY (id),
    CONSTRAINT pt_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT fk_rating_pt FOREIGN KEY (pt_id) REFERENCES public.users(id),
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Bảng vouchers
CREATE SEQUENCE public.vouchers_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.vouchers (
    id integer DEFAULT nextval('public.vouchers_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    used integer DEFAULT 0,
    total integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT vouchers_pkey PRIMARY KEY (id),
    CONSTRAINT vouchers_code_key UNIQUE (code),
    CONSTRAINT vouchers_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percent'::character varying, 'fixed'::character varying])::text[]))),
    CONSTRAINT vouchers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'depleted'::character varying])::text[])))
);

-- Bảng transactions
CREATE SEQUENCE public.transactions_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.transactions (
    id integer DEFAULT nextval('public.transactions_id_seq'::regclass) NOT NULL,
    receipt_no character varying(100) NOT NULL,
    user_id integer NOT NULL,
    membership_id integer NOT NULL,
    package_id character varying(50) NOT NULL,
    voucher_id integer,
    original_amount numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0,
    final_amount numeric(12,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    cashier_id integer,
    transaction_date timestamp without time zone DEFAULT now(),
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_receipt_no_key UNIQUE (receipt_no),
    CONSTRAINT fk_transaction_cashier FOREIGN KEY (cashier_id) REFERENCES public.users(id),
    CONSTRAINT fk_transaction_membership FOREIGN KEY (membership_id) REFERENCES public.memberships(id),
    CONSTRAINT fk_transaction_package FOREIGN KEY (package_id) REFERENCES public.packages(id),
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT fk_transaction_voucher FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id)
);

-- Bảng work_shifts
CREATE SEQUENCE public.work_shifts_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.work_shifts (
    id integer DEFAULT nextval('public.work_shifts_id_seq'::regclass) NOT NULL,
    employee_id integer NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    role_shift character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT work_shifts_pkey PRIMARY KEY (id),
    CONSTRAINT fk_shift_employee FOREIGN KEY (employee_id) REFERENCES public.users(id)
);

-- Bảng workout_plans
CREATE SEQUENCE public.workout_plans_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.workout_plans (
    id integer DEFAULT nextval('public.workout_plans_id_seq'::regclass) NOT NULL,
    pt_id integer NOT NULL,
    trainee_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    exercises jsonb NOT NULL,
    assigned_date date NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT workout_plans_pkey PRIMARY KEY (id),
    CONSTRAINT fk_plan_pt FOREIGN KEY (pt_id) REFERENCES public.users(id),
    CONSTRAINT fk_plan_trainee FOREIGN KEY (trainee_id) REFERENCES public.users(id)
);

-- Bảng gym_settings
CREATE TABLE public.gym_settings (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    email character varying(255),
    address text,
    open_time character varying(10),
    close_time character varying(10),
    logo text,
    CONSTRAINT gym_settings_pkey PRIMARY KEY (id)
);

-- ==========================================
-- 3. TRIGGER & FUNCTION LOGIC
-- ==========================================
CREATE OR REPLACE FUNCTION public.sync_user_status_and_active()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NEW.status = 'quit' THEN
            NEW.is_active := false;
        ELSIF NEW.status IN ('working', 'leave') AND NEW.is_active = false AND OLD.status = 'quit' THEN
            NEW.is_active := true;
        END IF;
    END IF;

    IF (TG_OP = 'UPDATE') AND (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
        IF NEW.is_active = true AND NEW.status = 'quit' THEN
            NEW.status := 'working';
        ELSIF NEW.is_active = false AND NEW.status = 'working' THEN
            NEW.status := 'quit';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_status_active
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_status_and_active();

-- 1. USERS (Bao gồm dữ liệu CSV cũ + Thêm Admin & Trạng thái làm việc)
-- Tài khoản Demo: admin@gmail.com, pt@gmail.com, user@gmail.com, staff@gmail.com
INSERT INTO public.users (id, email, password, role, full_name, phone, birth_date, gender, height, is_active, status, created_at, updated_at) VALUES
(1, 'user1@gympro.com', '$2b$10$mj/JdTlXx46aTqTieyn0wefceMei7IWLo/MyErZVf6Vvs155DiYJa', 'HV', 'Thanh Truong', '034567891', NULL, NULL, NULL, true, 'working', '2026-06-13 11:50:46', '2026-06-13 11:50:46'),
(2, 'user@gmail.com', '$2b$10$fyezjn8VldYIpgfuzD9kwusBsunyRnXlX1CFLZstLYda3ITi1n8/a', 'HV', 'Thành (Demo User)', '0123456789', '2000-01-01', 'male', 170.00, true, 'working', '2026-06-13 11:56:57', '2026-06-13 11:56:57'),
(3, 'pt@gmail.com', '$2b$10$6CBozHo//Un2AJkZgoeL2e8DgZ.6lCSIhTUwxHuKAQaIaCcFSdTUy', 'PT', 'Trọng (Demo PT)', '0345678912', '1995-05-15', 'male', 180.00, true, 'working', '2026-06-13 12:00:20', '2026-06-13 12:00:20'),
(4, 'trong.lm@gmail.com', '$2b$10$xOQlBtTX44VJ7Dosye.Nje7fK6s5iZpCQv8fr/fK3RnOAoJ8TW4Mi', 'HV', 'Lê Minh Trọng', '0901111111', '2004-01-10', 'male', 175.00, true, 'working', '2026-06-13 15:23:59', '2026-06-13 15:23:59'),
(5, 'vinh.ns@gmail.com', '$2b$10$xOQlBtTX44VJ7Dosye.Nje7fK6s5iZpCQv8fr/fK3RnOAoJ8TW4Mi', 'HV', 'Nguyễn Sỹ Vinh', '0902222222', '2004-05-20', 'male', 170.00, true, 'working', '2026-06-13 15:23:59', '2026-06-13 15:23:59'),
(6, 'tuan.npa@gmail.com', '$2b$10$xOQlBtTX44VJ7Dosye.Nje7fK6s5iZpCQv8fr/fK3RnOAoJ8TW4Mi', 'HV', 'Nguyễn Phạm Anh Tuấn', '0903333333', '2004-08-15', 'male', 178.50, true, 'working', '2026-06-13 15:23:59', '2026-06-13 15:23:59'),
(7, 'tuan.dd@gmail.com', '$2b$10$xOQlBtTX44VJ7Dosye.Nje7fK6s5iZpCQv8fr/fK3RnOAoJ8TW4Mi', 'HV', 'Đỗ Đức Tuân', '0904444444', '2004-11-25', 'male', 168.00, true, 'working', '2026-06-13 15:23:59', '2026-06-13 15:23:59'),
(8, 'ha.pt@gmail.com', '$2b$10$xOQlBtTX44VJ7Dosye.Nje7fK6s5iZpCQv8fr/fK3RnOAoJ8TW4Mi', 'HV', 'Phạm Thu Hà', '0905555555', '2004-03-08', 'female', 162.00, true, 'working', '2026-06-13 15:23:59', '2026-06-13 15:23:59'),
(9, 'my@gmail.com', '$2b$10$ul.g6WUgGYzyUZKO4VMSle1OXG.tycZuUMV9hMDb9gJBgGoy9XfYm', 'HV', 'my', '0987654321', NULL, NULL, NULL, true, 'working', '2026-06-13 22:25:02', '2026-06-13 22:25:02'),
(10, 'staff@gmail.com', '$2b$10$C.8SaI1ueEyYPVXVrpcxf.iqV2X14VxCscuWYb7iM3gu0Rl3AJ.5.', 'NV', 'Nhân viên 1 (Demo Staff)', '0123761239', '1998-08-08', 'female', 165.00, true, 'working', '2026-06-13 22:25:10', '2026-06-13 22:25:10'),
(11, 'admin@gmail.com', '$2b$10$6rez6LfCrM/oNkdgoVqtPOapGiq5IrzRrErnBJYja5R0XLHrVEuWG', 'AD', 'Admin GymPro', '0999999999', '1990-01-01', 'other', 170.00, true, 'working', now(), now()),
(12, 'pt_nghi@gmail.com', '$2b$10$mj/JdTlXx46aTqTieyn0wefceMei7IWLo/MyErZVf6Vvs155DiYJa', 'PT', 'PT Nghỉ Phép', '0888888888', '1992-02-02', 'male', 175.00, true, 'leave', now(), now()),
(13, 'staff_nghiviec@gmail.com', '$2b$10$mj/JdTlXx46aTqTieyn0wefceMei7IWLo/MyErZVf6Vvs155DiYJa', 'NV', 'Staff Nghỉ Việc', '0777777777', '1996-06-06', 'female', 160.00, false, 'quit', now(), now());

SELECT setval('public.users_id_seq', 13, true);

-- 2. GYM SETTINGS
INSERT INTO public.gym_settings (id, name, phone, email, address, open_time, close_time, logo) VALUES 
(1, 'GymPro Fitness Center', '0281234567', 'contact@gympro.vn', '123 Nguyễn Huệ, Q.1, TP.HCM', '06:00', '22:00', 'logo_gympro.png');

-- 3. PACKAGES (Gói tập cần có để dùng cho memberships & transactions)
INSERT INTO public.packages (id, name, type, duration_months, price, benefits, is_visible) VALUES
('STANDARD_3M', 'Standard 3 Tháng', 'STANDARD', 3, 1500000, '["Tập gym không giới hạn", "Sử dụng locker"]', true),
('BASIC_1M', 'Basic 1 Tháng', 'BASIC', 1, 600000, '["Tập gym không giới hạn"]', true),
('PREMIUM_6M', 'Premium 6 Tháng', 'PREMIUM', 6, 3500000, '["Tập gym", "Xông hơi", "1 khăn tắm/ngày"]', true),
('VIP_PT_3M', 'VIP Kèm PT 3 Tháng', 'VIP', 3, 9000000, '["36 buổi kèm PT", "Xông hơi", "Locker riêng"]', true);

-- 4. FACILITIES & EQUIPMENT
INSERT INTO public.facilities (id, name, capacity, description, address, phone, email, open_time, close_time) VALUES
(1, 'Phòng Tạ Tự Do (Tầng 1)', 50, 'Khu vực tạ đơn, tạ đòn, rack squat', 'Tầng 1, Tòa A', '0911111111', 'khu1@gympro.com', '06:00', '22:00'),
(2, 'Khu Máy Cardio (Tầng 2)', 30, 'Máy chạy bộ, xe đạp, eliptical', 'Tầng 2, Tòa A', '0922222222', 'khu2@gympro.com', '06:00', '22:00'),
(3, 'Phòng Chức Năng', 20, 'Khu vực giãn cơ, yoga, tập lớp', 'Tầng 3, Tòa A', '0933333333', 'khu3@gympro.com', '06:00', '22:00');
SELECT setval('public.facilities_id_seq', 3, true);

INSERT INTO public.equipment (id, code, name, facility_id, status, category, last_maintenance) VALUES
(1, 'CB-001', 'Máy chạy bộ Impulse', 2, 'active', 'Cardio', '2026-05-01'),
(2, 'CB-002', 'Máy chạy bộ số 3', 2, 'maintenance', 'Cardio', '2026-04-15'),
(3, 'SQ-001', 'Khung Squat Rack', 1, 'active', 'Strength', '2026-06-01'),
(4, 'DP-001', 'Ghế đẩy ngực Bench Press', 1, 'active', 'Strength', '2026-06-01'),
(5, 'YG-001', 'Thảm Yoga Xốp', 3, 'broken', 'Others', '2026-01-10');
SELECT setval('public.equipment_id_seq', 5, true);

-- 5. VOUCHERS
INSERT INTO public.vouchers (id, code, discount_type, discount_value, used, total, start_date, end_date, status) VALUES
(1, 'SUMMER2026', 'percent', 10.00, 1, 100, '2026-06-01', '2026-08-31', 'active'),
(2, 'NEWBIE', 'fixed', 200000.00, 50, 50, '2026-01-01', '2026-12-31', 'depleted');
SELECT setval('public.vouchers_id_seq', 2, true);

-- 6. MEMBERSHIPS & TRANSACTIONS
INSERT INTO public.memberships (id, user_id, package_id, start_date, end_date, total_sessions, remaining_sessions, status, created_at) VALUES
(1, 2, 'STANDARD_3M', '2026-06-01', '2026-09-01', 0, 0, 'expired', '2026-06-13 13:30:06'),
(2, 2, 'BASIC_1M', '2026-06-13', '2026-10-01', 0, 0, 'expired', '2026-06-13 13:30:26'),
(3, 2, 'PREMIUM_6M', '2026-06-13', '2027-04-02', 0, 0, 'expired', '2026-06-13 13:30:36'),
(4, 2, 'BASIC_1M', '2026-06-13', '2027-05-02', 0, 0, 'active', '2026-06-13 13:30:52'),
(5, 1, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 30, 'active', '2026-06-13 17:52:36'),
(6, 2, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 12, 'active', '2026-06-13 17:52:36'),
(7, 4, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 36, 'active', '2026-06-13 17:52:36'),
(8, 5, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 36, 'active', '2026-06-13 17:52:36'),
(9, 6, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 36, 'active', '2026-06-13 17:52:36'),
(10, 7, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 36, 'active', '2026-06-13 17:52:36'),
(11, 8, 'VIP_PT_3M', '2026-06-13', '2026-09-13', 36, 36, 'active', '2026-06-13 17:52:36');
SELECT setval('public.memberships_id_seq', 11, true);

INSERT INTO public.transactions (id, receipt_no, user_id, membership_id, package_id, voucher_id, original_amount, discount_amount, final_amount, payment_method, cashier_id) VALUES
(1, 'TXN-20260613-001', 2, 4, 'BASIC_1M', NULL, 600000.00, 0, 600000.00, 'BANK_TRANSFER', 10),
(2, 'TXN-20260613-002', 2, 6, 'VIP_PT_3M', 1, 9000000.00, 900000.00, 8100000.00, 'CREDIT_CARD', 10);
SELECT setval('public.transactions_id_seq', 2, true);

-- 7. ANNOUNCEMENTS (Bởi Admin)
INSERT INTO public.announcements (id, title, content, author_id) VALUES
(1, 'Chào Mừng Đến Với GymPro', 'Hệ thống phòng tập GymPro chính thức nâng cấp cơ sở vật chất từ tháng 6/2026.', 11),
(2, 'Thông báo nghỉ Lễ Quốc Khánh', 'Phòng tập vẫn mở cửa xuyên lễ phục vụ hội viên.', 11);
SELECT setval('public.announcements_id_seq', 2, true);

-- 8. BODY RECORDS (Chỉ số cơ thể)
INSERT INTO public.body_records (id, user_id, pt_id, weight, body_fat, muscle_mass, recorded_date, notes) VALUES
(1, 2, 3, 75.5, 20.0, 35.0, '2026-05-01', 'Đo lần đầu lúc mới đăng ký gói PT'),
(2, 2, 3, 73.0, 18.5, 36.2, '2026-06-01', 'Đã giảm mỡ, cần tập trung xô lưng thêm');
SELECT setval('public.body_records_id_seq', 2, true);

-- 9. BOOKINGS (Bao gồm dữ liệu CSV cũ)
INSERT INTO public.bookings (id, user_id, pt_id, date, time_slot, room, type, status, attendance_status) VALUES
(1, 2, 3, '2026-06-15', '08:00 - 09:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(2, 2, 3, '2026-06-18', '18:00 - 19:30', 'Khu máy Cardio', 'Tập cá nhân 1-1', 'pending', 'none'),
(3, 2, 3, '2026-06-10', '17:30 - 18:30', 'Phòng tập chức năng', 'Giãn cơ phục hồi', 'confirmed', 'checked_in'),
(4, 2, 3, '2026-06-14', '08:00 - 09:00', 'Khu Tạ A', 'STRENGTH CONDITIONING', 'pending', 'checked_in'),
(5, 2, 3, '2026-06-01', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Ngực - Tay sau)', 'confirmed', 'checked_in'),
(6, 2, 3, '2026-06-03', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Lưng - Xô)', 'confirmed', 'checked_in'),
(7, 2, 3, '2026-06-05', '20:00 - 21:30', 'Khu máy Cardio', 'Tập cá nhân 1-1 (Cardio HIIT)', 'confirmed', 'checked_in'),
(8, 2, 3, '2026-06-08', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Chân - Mông)', 'confirmed', 'absent'),
(9, 2, 3, '2026-06-11', '18:30 - 20:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Vai - Bụng)', 'cancelled', 'none'),
(10, 2, 3, '2026-06-17', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Ngực - Tay sau)', 'confirmed', 'none'),
(11, 2, 3, '2026-06-19', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Lưng - Xô)', 'confirmed', 'none'),
(12, 2, 3, '2026-06-21', '20:00 - 21:30', 'Phòng tập chức năng', 'Giãn cơ phục hồi', 'pending', 'none'),
(13, 2, 3, '2026-06-24', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Chân - Mông)', 'pending', 'none'),
(14, 2, 3, '2026-06-26', '19:30 - 21:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1 (Vai - Bụng)', 'pending', 'none'),
(15, 2, 3, '2026-06-28', '18:00 - 19:30', 'Khu máy Cardio', 'Tập cá nhân 1-1 (Cardio)', 'pending', 'none'),
(16, 1, 3, '2026-06-08', '08:00 - 09:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(17, 2, 3, '2026-06-08', '17:30 - 19:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(18, 4, 3, '2026-06-08', '19:30 - 21:00', 'Khu máy Cardio', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(19, 5, 3, '2026-06-09', '17:30 - 19:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(20, 6, 3, '2026-06-09', '19:30 - 21:00', 'Phòng tập chức năng', 'Giãn cơ phục hồi', 'confirmed', 'absent'),
(21, 7, 3, '2026-06-10', '08:00 - 09:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(22, 8, 3, '2026-06-10', '18:00 - 19:30', 'Khu máy Cardio', 'Tập cá nhân 1-1 (Cardio HIIT)', 'confirmed', 'checked_in'),
(23, 1, 3, '2026-06-11', '17:30 - 19:00', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(24, 2, 3, '2026-06-11', '19:30 - 21:00', 'Phòng tập chức năng', 'Giãn cơ', 'confirmed', 'checked_in'),
(25, 4, 3, '2026-06-12', '18:00 - 19:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'cancelled', 'none'),
(26, 5, 3, '2026-06-12', '19:30 - 21:00', 'Khu máy Cardio', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(27, 6, 3, '2026-06-13', '08:00 - 09:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'confirmed', 'checked_in'),
(28, 7, 3, '2026-06-13', '10:00 - 11:30', 'Phòng tập chức năng', 'Giãn cơ phục hồi', 'confirmed', 'none'),
(29, 8, 3, '2026-06-13', '18:00 - 19:30', 'Phòng Tạ Tự Do', 'Tập cá nhân 1-1', 'pending', 'none'),
(30, 2, 3, '2026-06-18', '06:00 - 07:00', 'Khu Tạ A', 'STRENGTH CONDITIONING', 'pending', 'none');
SELECT setval('public.bookings_id_seq', 30, true);

-- 10. CHECKINS
INSERT INTO public.checkins (id, user_id, checked_in_at, checked_in_by, checkin_method) VALUES
(1, 2, '2026-06-13 22:38:14', 10, 'QR_staff'),
(2, 6, '2026-06-13 22:38:25', 10, 'QR_staff'),
(3, 7, '2026-06-13 22:38:31', 10, 'QR_staff');
SELECT setval('public.checkins_id_seq', 3, true);

-- 11. EQUIPMENT REPORTS (Báo cáo hư hỏng thiết bị)
INSERT INTO public.equipment_reports (id, equipment_id, reporter_id, description, status) VALUES
(1, 2, 2, 'Máy chạy bộ số 3 bị rít khi chạy nhanh', 'resolved'),
(2, 5, 10, 'Thảm yoga rách nhiều góc', 'pending');
SELECT setval('public.equipment_reports_id_seq', 2, true);

-- 12. FEEDBACKS (Góp ý từ KH)
INSERT INTO public.feedbacks (id, user_id, content, reply_content, replier_id, status, created_at, replied_at) VALUES
(1, 2, '{"type":"service","title":"Bảo trì thiết bị","content":"Máy chạy bộ số 3 ở khu vực tầng 2 đang bị rít băng tải, mong phòng tập cử người kiểm tra và bảo trì sớm giúp mình."}', 'đã sửa', 10, 'responded', '2026-06-12 08:30:00', '2026-06-13 22:32:40'),
(2, 2, '{"type":"service","title":"Lịch hoạt động ngày lễ","content":"Cho mình hỏi tuần sau phòng tập có mở cửa vào ngày lễ không?"}', 'Chào bạn, phòng tập Gympro vẫn mở cửa hoạt động bình thường từ 6h00 đến 22h00 trong tất cả các ngày lễ nhé. Chúc bạn đi tập vui vẻ!', 1, 'responded', '2026-06-05 15:00:00', '2026-06-05 16:30:00'),
(3, 2, '{"type":"trainer","title":"hỗ trợ","content":"không sát sao","rating":1,"ptId":3}', NULL, NULL, 'pending', '2026-06-13 17:32:35', NULL);
SELECT setval('public.feedbacks_id_seq', 3, true);

-- 13. PT EVALUATIONS & PT RATINGS
INSERT INTO public.pt_evaluations (id, pt_id, trainee_id, score, content, evaluation_date) VALUES
(1, 3, 2, 6, '{"completionLevel":"average","ptReview":"ok","recommendations":"ok"}', '2026-06-01');
SELECT setval('public.pt_evaluations_id_seq', 1, true);

INSERT INTO public.pt_ratings (id, user_id, pt_id, rating, comment) VALUES
(1, 2, 3, 1, 'không sát sao');
SELECT setval('public.pt_ratings_id_seq', 1, true);

-- 14. WORK SHIFTS (Lịch làm việc của PT và Staff)
INSERT INTO public.work_shifts (id, employee_id, date, start_time, end_time, role_shift) VALUES
(1, 10, '2026-06-13', '06:00:00', '14:00:00', 'Lễ tân Sáng'),
(2, 10, '2026-06-14', '14:00:00', '22:00:00', 'Lễ tân Chiều'),
(3, 3, '2026-06-13', '08:00:00', '20:00:00', 'PT Trực Tầng 1'),
(4, 3, '2026-06-15', '06:00:00', '18:00:00', 'PT Trực Tầng 2');
SELECT setval('public.work_shifts_id_seq', 4, true);

-- 15. WORKOUT PLANS
INSERT INTO public.workout_plans (id, pt_id, trainee_id, name, description, exercises, assigned_date) VALUES
(1, 3, 2, 'Giáo án Hypertrophy - Tăng Cơ Toàn Diện', 'Tập trung vào các bài tập đa khớp (Compound) ở mức tạ 70-80% 1RM để kích thích phát triển cơ bắp, kết hợp giãn cơ cuối buổi.', '[{"day": "Buổi 1 (Ngực - Vai - Tay sau)", "workouts": [{"name": "Barbell Bench Press", "reps": "8-10", "rest": "90s", "sets": 4}, {"name": "Incline Dumbbell Press", "reps": "10-12", "rest": "60s", "sets": 3}, {"name": "Overhead Press", "reps": "10", "rest": "60s", "sets": 3}, {"name": "Triceps Pushdown", "reps": "12-15", "rest": "45s", "sets": 3}]}, {"day": "Buổi 2 (Lưng - Xô - Tay trước)", "workouts": [{"name": "Deadlift", "reps": "5-8", "rest": "120s", "sets": 3}, {"name": "Lat Pulldown", "reps": "10-12", "rest": "60s", "sets": 4}, {"name": "Barbell Row", "reps": "10", "rest": "60s", "sets": 3}, {"name": "Bicep Curls", "reps": "12-15", "rest": "45s", "sets": 3}]}]', '2026-06-13'),
(2, 3, 4, 'Giáo án Cardio & Giảm Mỡ', 'Kết hợp tập tạ nhẹ và các bài Cardio cường độ cao HIIT để tối ưu việc đốt cháy calo trong thời gian ngắn.', '[{"day": "Buổi 1 (Full Body & Cardio)", "workouts": [{"name": "Goblet Squat", "reps": "15", "rest": "60s", "sets": 3}, {"name": "Push ups", "reps": "AMRAP (Tối đa)", "rest": "60s", "sets": 3}, {"name": "Kettlebell Swing", "reps": "20", "rest": "45s", "sets": 3}]}, {"day": "Buổi 2 (HIIT Treadmill)", "workouts": [{"name": "Đi bộ khởi động", "speed": "5.0 km/h", "duration": "5 phút"}, {"name": "Chạy nước rút (Sprint)", "speed": "14.0 km/h", "repeat": "8 lần", "duration": "30 giây"}, {"name": "Đi bộ nghỉ ngơi giữa các hiệp", "speed": "4.0 km/h", "repeat": "8 lần", "duration": "60 giây"}, {"name": "Đi bộ thả lỏng", "speed": "4.0 km/h", "duration": "5 phút"}]}]', '2026-06-13');
SELECT setval('public.workout_plans_id_seq', 2, true);

-- 1. Thêm cột pt_sessions vào bảng packages
ALTER TABLE public.packages ADD COLUMN pt_sessions integer DEFAULT 0;
-- 2. Cập nhật dữ liệu cho các gói hiện có
UPDATE public.packages SET pt_sessions = 36 WHERE id = 'VIP_PT_3M';
UPDATE public.packages SET pt_sessions = 0 WHERE id IN ('STANDARD_3M', 'BASIC_1M', 'PREMIUM_6M');
