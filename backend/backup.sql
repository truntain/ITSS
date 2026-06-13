CREATE DATABASE "Gympro" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';

 CREATE TABLE public.announcements (
 	id integer NOT NULL,
 	title character varying(255) NOT NULL,
 	content text NOT NULL,
 	author_id integer NOT NULL,
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.announcements_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;

 CREATE TABLE public.body_records (
 	id integer NOT NULL,
 	user_id integer NOT NULL,
 	pt_id integer,
 	weight numeric(5,2) NOT NULL,
 	body_fat numeric(4,2) NOT NULL,
 	muscle_mass numeric(4,2),
 	recorded_date date NOT NULL,
 	notes text,
 	created_at timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.body_records_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.body_records_id_seq OWNED BY public.body_records.id;

 CREATE TABLE public.bookings (
 	id integer NOT NULL,
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
 	CONSTRAINT bookings_attendance_status_check CHECK (((attendance_status)::text = ANY ((ARRAY['none'::character varying, 'checked_in'::character varying, 'absent'::character varying])::text[]))),
 	CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'cancelled'::character varying])::text[])))
 );

 CREATE SEQUENCE public.bookings_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;

 CREATE TABLE public.checkins (
 	id integer NOT NULL,
 	user_id integer NOT NULL,
 	checked_in_at timestamp without time zone DEFAULT now(),
 	checked_in_by integer,
 	checkin_method character varying(50) DEFAULT 'QR_member'::character varying
 );

 CREATE SEQUENCE public.checkins_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.checkins_id_seq OWNED BY public.checkins.id;

 CREATE TABLE public.equipment (
 	id integer NOT NULL,
 	code character varying(50) NOT NULL,
 	name character varying(255) NOT NULL,
 	facility_id integer NOT NULL,
 	status character varying(50) DEFAULT 'active'::character varying,
 	last_maintenance date,
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT equipment_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'maintenance'::character varying, 'broken'::character varying])::text[])))
 );

 CREATE SEQUENCE public.equipment_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;

 CREATE TABLE public.equipment_reports (
 	id integer NOT NULL,
 	equipment_id integer NOT NULL,
 	reporter_id integer NOT NULL,
 	description text NOT NULL,
 	status character varying(50) DEFAULT 'pending'::character varying,
 	reported_at timestamp without time zone DEFAULT now(),
 	resolved_at timestamp without time zone,
 	CONSTRAINT equipment_reports_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'resolved'::character varying])::text[])))
 );

 CREATE SEQUENCE public.equipment_reports_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.equipment_reports_id_seq OWNED BY public.equipment_reports.id;

 CREATE TABLE public.facilities (
 	id integer NOT NULL,
 	name character varying(255) NOT NULL,
 	capacity integer NOT NULL,
 	description text,
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.facilities_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.facilities_id_seq OWNED BY public.facilities.id;

 CREATE TABLE public.feedbacks (
 	id integer NOT NULL,
 	user_id integer NOT NULL,
 	content text NOT NULL,
 	reply_content text,
 	replier_id integer,
 	status character varying(20) DEFAULT 'pending'::character varying,
 	created_at timestamp without time zone DEFAULT now(),
 	replied_at timestamp without time zone,
 	CONSTRAINT feedbacks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'responded'::character varying])::text[])))
 );

 CREATE SEQUENCE public.feedbacks_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;

 CREATE TABLE public.memberships (
 	id integer NOT NULL,
 	user_id integer NOT NULL,
 	package_id character varying(50) NOT NULL,
 	start_date date NOT NULL,
 	end_date date NOT NULL,
 	total_sessions integer DEFAULT 0,
 	remaining_sessions integer DEFAULT 0,
 	status character varying(20) DEFAULT 'active'::character varying,
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT memberships_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'paused'::character varying])::text[])))
 );

 CREATE SEQUENCE public.memberships_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.memberships_id_seq OWNED BY public.memberships.id;

 CREATE TABLE public.packages (
 	id character varying(50) NOT NULL,
 	name character varying(255) NOT NULL,
 	type character varying(50) NOT NULL,
 	duration_months integer NOT NULL,
 	price numeric(12,2) NOT NULL,
 	benefits jsonb NOT NULL,
 	is_visible boolean DEFAULT true,
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now()
 );

 CREATE TABLE public.pt_evaluations (
 	id integer NOT NULL,
 	pt_id integer NOT NULL,
 	trainee_id integer NOT NULL,
 	score integer NOT NULL,
 	content text NOT NULL,
 	evaluation_date date NOT NULL,
 	created_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT pt_evaluations_score_check CHECK (((score >= 1) AND (score <= 10)))
 );

 CREATE SEQUENCE public.pt_evaluations_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.pt_evaluations_id_seq OWNED BY public.pt_evaluations.id;

 CREATE TABLE public.pt_ratings (
 	id integer NOT NULL,
 	user_id integer NOT NULL,
 	pt_id integer NOT NULL,
 	rating integer NOT NULL,
 	comment text,
 	created_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT pt_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
 );

 CREATE SEQUENCE public.pt_ratings_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.pt_ratings_id_seq OWNED BY public.pt_ratings.id;

 CREATE TABLE public.transactions (
 	id integer NOT NULL,
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
 	transaction_date timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.transactions_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;

 CREATE TABLE public.users (
 	id integer NOT NULL,
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
 	created_at timestamp without time zone DEFAULT now(),
 	updated_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT users_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[]))),
 	CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['HV'::character varying, 'PT'::character varying, 'NV'::character varying, 'AD'::character varying])::text[])))
 );

 CREATE SEQUENCE public.users_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

 CREATE TABLE public.vouchers (
 	id integer NOT NULL,
 	code character varying(50) NOT NULL,
 	discount_type character varying(20) NOT NULL,
 	discount_value numeric(12,2) NOT NULL,
 	used integer DEFAULT 0,
     total integer NOT NULL,
 	start_date date NOT NULL,
 	end_date date NOT NULL,
 	status character varying(20) DEFAULT 'active'::character varying,
 	created_at timestamp without time zone DEFAULT now(),
 	CONSTRAINT vouchers_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percent'::character varying, 'fixed'::character varying])::text[]))),
 	CONSTRAINT vouchers_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'depleted'::character varying])::text[])))
 );

 CREATE SEQUENCE public.vouchers_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;

 CREATE TABLE public.work_shifts (
 	id integer NOT NULL,
 	employee_id integer NOT NULL,
 	date date NOT NULL,
 	start_time time without time zone NOT NULL,
 	end_time time without time zone NOT NULL,
 	role_shift character varying(100),
 	created_at timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.work_shifts_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.work_shifts_id_seq OWNED BY public.work_shifts.id;

 CREATE TABLE public.workout_plans (
 	id integer NOT NULL,
 	pt_id integer NOT NULL,
 	trainee_id integer NOT NULL,
 	name character varying(255) NOT NULL,
 	description text,
 	exercises jsonb NOT NULL,
 	assigned_date date NOT NULL,
 	created_at timestamp without time zone DEFAULT now()
 );

 CREATE SEQUENCE public.workout_plans_id_seq
 	AS integer
 	START WITH 1
 	INCREMENT BY 1
 	NO MINVALUE
 	NO MAXVALUE
 	CACHE 1;

 ALTER SEQUENCE public.workout_plans_id_seq OWNED BY public.workout_plans.id;

 ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);

 ALTER TABLE public.announcements ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.body_records ALTER COLUMN id SET DEFAULT nextval('public.body_records_id_seq'::regclass);

 ALTER TABLE public.body_records ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);

 ALTER TABLE public.bookings ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.checkins ALTER COLUMN id SET DEFAULT nextval('public.checkins_id_seq'::regclass);

 ALTER TABLE public.checkins ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);

 ALTER TABLE public.equipment ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.equipment_reports ALTER COLUMN id SET DEFAULT nextval('public.equipment_reports_id_seq'::regclass);

 ALTER TABLE public.equipment_reports ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.facilities ALTER COLUMN id SET DEFAULT nextval('public.facilities_id_seq'::regclass);

 ALTER TABLE public.facilities ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);

 ALTER TABLE public.feedbacks ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.memberships ALTER COLUMN id SET DEFAULT nextval('public.memberships_id_seq'::regclass);

 ALTER TABLE public.memberships ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.pt_evaluations ALTER COLUMN id SET DEFAULT nextval('public.pt_evaluations_id_seq'::regclass);

 ALTER TABLE public.pt_evaluations ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.pt_ratings ALTER COLUMN id SET DEFAULT nextval('public.pt_ratings_id_seq'::regclass);

 ALTER TABLE public.pt_ratings ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);

 ALTER TABLE public.transactions ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

 ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);

 ALTER TABLE public.vouchers ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.work_shifts ALTER COLUMN id SET DEFAULT nextval('public.work_shifts_id_seq'::regclass);

 ALTER TABLE public.work_shifts ALTER COLUMN id DROP DEFAULT;

 ALTER TABLE ONLY public.workout_plans ALTER COLUMN id SET DEFAULT nextval('public.workout_plans_id_seq'::regclass);

 ALTER TABLE public.workout_plans ALTER COLUMN id DROP DEFAULT;

 SELECT pg_catalog.setval('public.announcements_id_seq', 2, true);

 SELECT pg_catalog.setval('public.body_records_id_seq', 3, true);

 SELECT pg_catalog.setval('public.bookings_id_seq', 2, true);

 SELECT pg_catalog.setval('public.checkins_id_seq', 4, true);

 SELECT pg_catalog.setval('public.equipment_id_seq', 3, true);

 SELECT pg_catalog.setval('public.equipment_reports_id_seq', 2, true);

 SELECT pg_catalog.setval('public.facilities_id_seq', 3, true);

 SELECT pg_catalog.setval('public.feedbacks_id_seq', 2, true);

 SELECT pg_catalog.setval('public.memberships_id_seq', 4, true);

 SELECT pg_catalog.setval('public.pt_evaluations_id_seq', 1, true);

 SELECT pg_catalog.setval('public.pt_ratings_id_seq', 2, true);

 SELECT pg_catalog.setval('public.transactions_id_seq', 3, true);

 SELECT pg_catalog.setval('public.users_id_seq', 10, true);

 SELECT pg_catalog.setval('public.vouchers_id_seq', 3, true);

 SELECT pg_catalog.setval('public.work_shifts_id_seq', 4, true);

 SELECT pg_catalog.setval('public.workout_plans_id_seq', 1, true);

 ALTER TABLE ONLY public.announcements
 	ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.announcements DROP CONSTRAINT announcements_pkey;

 ALTER TABLE ONLY public.body_records
 	ADD CONSTRAINT body_records_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.body_records DROP CONSTRAINT body_records_pkey;

 ALTER TABLE ONLY public.bookings
 	ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.bookings DROP CONSTRAINT bookings_pkey;

 ALTER TABLE ONLY public.checkins
 	ADD CONSTRAINT checkins_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.checkins DROP CONSTRAINT checkins_pkey;

 ALTER TABLE ONLY public.equipment
 	ADD CONSTRAINT equipment_code_key UNIQUE (code);

 ALTER TABLE ONLY public.equipment DROP CONSTRAINT equipment_code_key;

 ALTER TABLE ONLY public.equipment
 	ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.equipment DROP CONSTRAINT equipment_pkey;

 ALTER TABLE ONLY public.equipment_reports
 	ADD CONSTRAINT equipment_reports_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.equipment_reports DROP CONSTRAINT equipment_reports_pkey;

 ALTER TABLE ONLY public.facilities
 	ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.facilities DROP CONSTRAINT facilities_pkey;

 ALTER TABLE ONLY public.feedbacks
 	ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.feedbacks DROP CONSTRAINT feedbacks_pkey;

 ALTER TABLE ONLY public.memberships
 	ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.memberships DROP CONSTRAINT memberships_pkey;

 ALTER TABLE ONLY public.packages
 	ADD CONSTRAINT packages_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.packages DROP CONSTRAINT packages_pkey;

 ALTER TABLE ONLY public.pt_evaluations
 	ADD CONSTRAINT pt_evaluations_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.pt_evaluations DROP CONSTRAINT pt_evaluations_pkey;

 ALTER TABLE ONLY public.pt_ratings
 	ADD CONSTRAINT pt_ratings_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.pt_ratings DROP CONSTRAINT pt_ratings_pkey;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT transactions_receipt_no_key UNIQUE (receipt_no);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_receipt_no_key;

 ALTER TABLE ONLY public.users
 	ADD CONSTRAINT users_email_key UNIQUE (email);

 ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;

 ALTER TABLE ONLY public.users
 	ADD CONSTRAINT users_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;

 ALTER TABLE ONLY public.vouchers
 	ADD CONSTRAINT vouchers_code_key UNIQUE (code);

 ALTER TABLE ONLY public.vouchers DROP CONSTRAINT vouchers_code_key;

 ALTER TABLE ONLY public.vouchers
 	ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.vouchers DROP CONSTRAINT vouchers_pkey;

 ALTER TABLE ONLY public.work_shifts
 	ADD CONSTRAINT work_shifts_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.work_shifts DROP CONSTRAINT work_shifts_pkey;

 ALTER TABLE ONLY public.workout_plans
 	ADD CONSTRAINT workout_plans_pkey PRIMARY KEY (id);

 ALTER TABLE ONLY public.workout_plans DROP CONSTRAINT workout_plans_pkey;

 ALTER TABLE ONLY public.announcements
 	ADD CONSTRAINT fk_announcement_author FOREIGN KEY (author_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.announcements DROP CONSTRAINT fk_announcement_author;

 ALTER TABLE ONLY public.body_records
 	ADD CONSTRAINT fk_body_pt FOREIGN KEY (pt_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.body_records DROP CONSTRAINT fk_body_pt;

 ALTER TABLE ONLY public.body_records
 	ADD CONSTRAINT fk_body_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.body_records DROP CONSTRAINT fk_body_user;

 ALTER TABLE ONLY public.bookings
 	ADD CONSTRAINT fk_booking_pt FOREIGN KEY (pt_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.bookings DROP CONSTRAINT fk_booking_pt;

 ALTER TABLE ONLY public.bookings
 	ADD CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.bookings DROP CONSTRAINT fk_booking_user;

 ALTER TABLE ONLY public.checkins
 	ADD CONSTRAINT fk_checkin_staff FOREIGN KEY (checked_in_by) REFERENCES public.users(id);

 ALTER TABLE ONLY public.checkins DROP CONSTRAINT fk_checkin_staff;

 ALTER TABLE ONLY public.checkins
 	ADD CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.checkins DROP CONSTRAINT fk_checkin_user;

 ALTER TABLE ONLY public.equipment
 	ADD CONSTRAINT fk_equipment_facility FOREIGN KEY (facility_id) REFERENCES public.facilities(id);

 ALTER TABLE ONLY public.equipment DROP CONSTRAINT fk_equipment_facility;

 ALTER TABLE ONLY public.pt_evaluations
 	ADD CONSTRAINT fk_evaluation_pt FOREIGN KEY (pt_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.pt_evaluations DROP CONSTRAINT fk_evaluation_pt;

 ALTER TABLE ONLY public.pt_evaluations
 	ADD CONSTRAINT fk_evaluation_trainee FOREIGN KEY (trainee_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.pt_evaluations DROP CONSTRAINT fk_evaluation_trainee;

 ALTER TABLE ONLY public.feedbacks
 	ADD CONSTRAINT fk_feedback_replier FOREIGN KEY (replier_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.feedbacks DROP CONSTRAINT fk_feedback_replier;

 ALTER TABLE ONLY public.feedbacks
 	ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.feedbacks DROP CONSTRAINT fk_feedback_user;

 ALTER TABLE ONLY public.memberships
 	ADD CONSTRAINT fk_membership_package FOREIGN KEY (package_id) REFERENCES public.packages(id);

 ALTER TABLE ONLY public.memberships DROP CONSTRAINT fk_membership_package;

 ALTER TABLE ONLY public.memberships
 	ADD CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.memberships DROP CONSTRAINT fk_membership_user;

 ALTER TABLE ONLY public.workout_plans
 	ADD CONSTRAINT fk_plan_pt FOREIGN KEY (pt_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.workout_plans DROP CONSTRAINT fk_plan_pt;

 ALTER TABLE ONLY public.workout_plans
 	ADD CONSTRAINT fk_plan_trainee FOREIGN KEY (trainee_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.workout_plans DROP CONSTRAINT fk_plan_trainee;

 ALTER TABLE ONLY public.pt_ratings
 	ADD CONSTRAINT fk_rating_pt FOREIGN KEY (pt_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.pt_ratings DROP CONSTRAINT fk_rating_pt;

 ALTER TABLE ONLY public.pt_ratings
 	ADD CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.pt_ratings DROP CONSTRAINT fk_rating_user;

 ALTER TABLE ONLY public.equipment_reports
 	ADD CONSTRAINT fk_report_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);

 ALTER TABLE ONLY public.equipment_reports DROP CONSTRAINT fk_report_equipment;

 ALTER TABLE ONLY public.equipment_reports
 	ADD CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.equipment_reports DROP CONSTRAINT fk_reporter;

 ALTER TABLE ONLY public.work_shifts
 	ADD CONSTRAINT fk_shift_employee FOREIGN KEY (employee_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.work_shifts DROP CONSTRAINT fk_shift_employee;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT fk_transaction_cashier FOREIGN KEY (cashier_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_transaction_cashier;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT fk_transaction_membership FOREIGN KEY (membership_id) REFERENCES public.memberships(id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_transaction_membership;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT fk_transaction_package FOREIGN KEY (package_id) REFERENCES public.packages(id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_transaction_package;

 ALTER TABLE ONLY public.transactions
     ADD CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES public.users(id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_transaction_user;

 ALTER TABLE ONLY public.transactions
 	ADD CONSTRAINT fk_transaction_voucher FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id);

 ALTER TABLE ONLY public.transactions DROP CONSTRAINT fk_transaction_voucher;

-- ==========================================
-- 1. TẠO KIỂU ENUM MỚI CHO TRẠNG THÁI NHÂN VIÊN
-- ==========================================
CREATE TYPE user_status AS ENUM ('working', 'leave', 'quit');


-- ==========================================
-- 2. THÊM CỘT STATUS VÀO BẢNG USERS
-- ==========================================
-- Lưu ý: Vì bạn yêu cầu kiểu varchar(50) và check enum, hoặc trực tiếp dùng kiểu ENUM 
-- Việc dùng trực tiếp kiểu ENUM vừa tạo ở trên là cách chuẩn nhất trong Postgres.
-- Ràng buộc CHECK sẽ đảm bảo giá trị nằm trong 3 trạng thái này.

ALTER TABLE public.users 
ADD COLUMN status character varying(50) DEFAULT 'working'::character varying,
ADD CONSTRAINT users_status_check CHECK (status::text = ANY (ARRAY['working'::text, 'leave'::text, 'quit'::text]));


-- ==========================================
-- 3. ĐỒNG BỘ HÓA LOGIC BẰNG TRIGGER
-- ==========================================

-- 3.1. Tạo hàm xử lý logic (Trigger Function)
CREATE OR REPLACE FUNCTION public.sync_user_status_and_active()
RETURNS TRIGGER AS $$
BEGIN
    -- Trường hợp 1: Người dùng chủ động cập nhật cột STATUS
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NEW.status = 'quit' THEN
            NEW.is_active := false;
        ELSIF NEW.status IN ('working', 'leave') AND NEW.is_active = false AND OLD.status = 'quit' THEN
            -- Nếu từ quit quay lại làm việc thì kích hoạt lại tài khoản
            NEW.is_active := true;
        END IF;
    END IF;

    -- Trường hợp 2: Người dùng chủ động cập nhật cột IS_ACTIVE
    IF (TG_OP = 'UPDATE') AND (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
        -- Nếu chặn active (is_active = false) mà status cũ chưa phải là quit/leave, bạn có thể cân nhắc giữ nguyên hoặc chuyển sang quit.
        -- Ở đây xử lý logic: nếu chuyển is_active thành true thì status không thể là 'quit' (tự động đưa về 'working')
        IF NEW.is_active = true AND NEW.status = 'quit' THEN
            NEW.status := 'working';
        -- Ngược lại nếu chuyển is_active thành false và status đang là working/leave, tự động đưa về 'quit'
        ELSIF NEW.is_active = false AND NEW.status = 'working' THEN
            NEW.status := 'quit';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2. Tạo Trigger gán vào bảng users
CREATE TRIGGER trg_sync_user_status_active
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_status_and_active();

-- ==========================================
-- 1. KHỞI TẠO KIỂU ENUM MỚI CHO LOẠI THIẾT BỊ
-- ==========================================
-- Tạo kiểu ENUM lưu trữ các phân loại thiết bị chính
CREATE TYPE equipment_category AS ENUM ('Cardio', 'Strength', 'Classroom', 'Others');


-- ==========================================
-- 2. CẬP NHẬT BẢNG EQUIPMENT
-- ==========================================
-- Thêm cột category sử dụng kiểu dữ liệu ENUM vừa tạo
-- Đặt giá trị mặc định (DEFAULT) là 'Others' để các thiết bị hiện tại không bị lỗi dữ liệu
ALTER TABLE public.equipment 
ADD COLUMN category equipment_category NOT NULL DEFAULT 'Others';

ALTER TABLE public.facilities
ADD COLUMN address     TEXT,
ADD COLUMN phone       VARCHAR(20),
ADD COLUMN email       VARCHAR(255),
ADD COLUMN open_time   VARCHAR(10),
ADD COLUMN close_time  VARCHAR(10);

-- ==========================================
-- 4. TẠO BẢNG CẤU HÌNH PHÒNG TẬP (GYM SETTINGS)
-- ==========================================
CREATE TABLE public.gym_settings (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    email character varying(255),
    address text,
    open_time character varying(10),
    close_time character varying(10),
    CONSTRAINT gym_settings_pkey PRIMARY KEY (id)
);

INSERT INTO public.gym_settings (id, name, phone, email, address, open_time, close_time)
VALUES (1, 'GymPro Fitness Center', '0281234567', 'contact@gympro.vn', '123 Nguyễn Huệ, Q.1, TP.HCM', '06:00', '22:00')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. CẤU HÌNH CASCADE DELETE CHO FACILITIES
-- ==========================================
ALTER TABLE public.equipment_reports DROP CONSTRAINT IF EXISTS fk_report_equipment;
ALTER TABLE public.equipment_reports ADD CONSTRAINT fk_report_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS fk_equipment_facility;
ALTER TABLE public.equipment ADD CONSTRAINT fk_equipment_facility FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE CASCADE;

ALTER TABLE public.gym_settings ADD COLUMN logo TEXT;