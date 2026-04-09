-- PostgreSQL Version (compatible with the compose setup)

-- Drop existing tables
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','manager','employee')),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password, role, email) VALUES
('admin','Admin@1234','admin','admin@nextrade.vn'),
('manager_nam','Nam2025!','manager','nam.nguyen@nextrade.vn'),
('hr_linh','Linh@hr99','manager','linh.tran@nextrade.vn'),
('emp_minh','minh123','employee','minh.le@nextrade.vn'),
('emp_huong','huong456','employee','huong.pham@nextrade.vn');

-- 2. EMPLOYEES
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(15,2) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    joined_date DATE DEFAULT CURRENT_DATE
);

INSERT INTO employees (user_id, full_name, department, position, salary, phone, address, joined_date) VALUES
(1, 'Nguyễn Văn An', 'Executive', 'CEO', 25000000.00, '0901234567', 'Hà Nội', '2021-04-01'),
(3, 'Trần Thị Linh', 'HR', 'HR Manager', 18000000.00, '0912345678', 'Sài Gòn', '2022-02-10'),
(4, 'Lê Văn Minh', 'IT', 'Support Engineer', 12000000.00, '0987654321', 'Đà Nẵng', '2023-01-15'),
(5, 'Phạm Thị Hương', 'Sales', 'Sales Executive', 11500000.00, '0976543210', 'Sài Gòn', '2023-05-20');

-- 3. ACCOUNTS
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'VND',
    owner_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50)
);

INSERT INTO categories (name, description, icon) VALUES
('Máy tính', 'Laptop, Desktop, Workstation', '💻'),
('Thiết bị ngoại vi', 'Chuột, bàn phím, tai nghe', '🖱️'),
('Màn hình', 'Monitor, projector', '🖥️'),
('Phần cứng máy chủ', 'Server, storage', '🔒'),
('Thiết bị văn phòng', 'Ghế, bàn, tủ lưu trữ', '🪑'),
('Thiết bị bảo mật', 'Token, card reader, camera', '🔐');

-- 5. PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(15,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'In Stock' CHECK (availability_status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Pre-order')),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, category_id, price, description, image_url, rating, rating_count, availability_status) VALUES
('Laptop Enterprise v1', 1, 24990000, 'Máy tính xách tay tiêu chuẩn cho nhân viên NexTrade. Tích hợp sẵn VPN nội bộ.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 4.5, 24, 'In Stock'),
('Secure Token Gen2', 6, 1200000, 'Thiết bị xác thực 2 lớp dùng để đăng nhập hệ thống nội bộ.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500', 4.8, 15, 'In Stock'),
('Logistics Tablet', 1, 8500000, 'Máy tính bảng kiểm kho chuyên dụng, chống sốc, chống nước.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 4.6, 18, 'In Stock'),
('Màn hình cong 34 inch', 3, 15000000, 'Màn hình ultrawide cho phòng vận hành logistics theo dõi bản đồ.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 4.7, 22, 'Low Stock'),
('Bàn phím cơ Silent', 2, 2500000, 'Bàn phím cơ chống ồn, phù hợp môi trường văn phòng đông người.', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', 4.4, 19, 'In Stock'),
('Ghế công thái học', 5, 4500000, 'Ghế lưới thoáng khí, bảo vệ cột sống cho nhân viên ngồi lâu.', 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500', 4.6, 20, 'In Stock'),
('Micro họp trực tuyến', 2, 3200000, 'Micro không dây đa hướng dành cho phòng họp công ty.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500', 4.3, 12, 'In Stock'),
('Server Blade System', 4, 120000000, 'Hệ thống máy chủ xử lý dữ liệu đơn hàng khối lượng lớn.', 'https://th.bing.com/th/id/OIP.wONyyIPQsX5iI_TKHF_x6wHaGM?w=203&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3', 4.8, 8, 'Low Stock'),
('Máy quét thẻ nhân viên', 6, 800000, 'Thiết bị đọc mã vạch 2D và thẻ từ RFID.', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500', 4.7, 16, 'In Stock'),
('Tai nghe chống ồn', 2, 1800000, 'Tai nghe tích hợp mic lọc âm, chuyên dụng cho phòng CSKH.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 4.5, 21, 'In Stock');

-- 6. STOCK/INVENTORY (with regions)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    region VARCHAR(100) NOT NULL,
    warehouse_code VARCHAR(50),
    quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO inventory (product_id, region, warehouse_code, quantity, reorder_level) VALUES
-- Product 1: Laptop Enterprise v1
(1, 'London', 'LON-W01', 450, 100),
(1, 'London', 'LON-W02', 520, 100),
(1, 'London', 'LON-W03', 280, 80),
(1, 'Epstein Island', 'EPI-W01', 350, 90),
(1, 'Epstein Island', 'EPI-W02', 500, 110),
(1, 'Ho Chi Minh', 'HCM-W01', 750, 150),
(1, 'Ho Chi Minh', 'HCM-W02', 680, 130),
(1, 'Ho Chi Minh', 'HCM-W03', 670, 120),
(1, 'Hanoi', 'HN-W01', 620, 120),
(1, 'Hanoi', 'HN-W02', 580, 110),
(1, 'Hanoi', 'HN-W03', 450, 100),
(1, 'Da Nang', 'DN-W01', 520, 100),
(1, 'Da Nang', 'DN-W02', 400, 90),

-- Product 2: Secure Token Gen2
(2, 'London', 'LON-W01', 320, 60),
(2, 'London', 'LON-W02', 280, 60),
(2, 'London', 'LON-W03', 150, 40),
(2, 'Epstein Island', 'EPI-W01', 180, 50),
(2, 'Epstein Island', 'EPI-W02', 220, 60),
(2, 'Ho Chi Minh', 'HCM-W01', 450, 80),
(2, 'Ho Chi Minh', 'HCM-W02', 420, 80),
(2, 'Ho Chi Minh', 'HCM-W03', 380, 70),
(2, 'Hanoi', 'HN-W01', 380, 70),
(2, 'Hanoi', 'HN-W02', 360, 60),
(2, 'Hanoi', 'HN-W03', 290, 50),
(2, 'Da Nang', 'DN-W01', 310, 60),
(2, 'Da Nang', 'DN-W02', 280, 50),

-- Product 3: Logistics Tablet
(3, 'London', 'LON-W01', 180, 40),
(3, 'London', 'LON-W02', 200, 40),
(3, 'London', 'LON-W03', 120, 30),
(3, 'Epstein Island', 'EPI-W01', 100, 25),
(3, 'Epstein Island', 'EPI-W02', 140, 35),
(3, 'Ho Chi Minh', 'HCM-W01', 280, 50),
(3, 'Ho Chi Minh', 'HCM-W02', 250, 50),
(3, 'Ho Chi Minh', 'HCM-W03', 220, 40),
(3, 'Hanoi', 'HN-W01', 240, 40),
(3, 'Hanoi', 'HN-W02', 220, 40),
(3, 'Hanoi', 'HN-W03', 180, 30),
(3, 'Da Nang', 'DN-W01', 200, 35),
(3, 'Da Nang', 'DN-W02', 160, 30),

-- Product 4: Màn hình cong 34 inch
(4, 'London', 'LON-W01', 45, 15),
(4, 'London', 'LON-W02', 38, 15),
(4, 'London', 'LON-W03', 22, 10),
(4, 'Epstein Island', 'EPI-W01', 28, 10),
(4, 'Epstein Island', 'EPI-W02', 35, 12),
(4, 'Ho Chi Minh', 'HCM-W01', 85, 25),
(4, 'Ho Chi Minh', 'HCM-W02', 75, 25),
(4, 'Ho Chi Minh', 'HCM-W03', 65, 20),
(4, 'Hanoi', 'HN-W01', 72, 20),
(4, 'Hanoi', 'HN-W02', 68, 20),
(4, 'Hanoi', 'HN-W03', 55, 15),
(4, 'Da Nang', 'DN-W01', 60, 18),
(4, 'Da Nang', 'DN-W02', 48, 15),

-- Product 5: Bàn phím cơ Silent
(5, 'London', 'LON-W01', 280, 50),
(5, 'London', 'LON-W02', 320, 50),
(5, 'London', 'LON-W03', 200, 40),
(5, 'Epstein Island', 'EPI-W01', 220, 45),
(5, 'Epstein Island', 'EPI-W02', 280, 55),
(5, 'Ho Chi Minh', 'HCM-W01', 520, 100),
(5, 'Ho Chi Minh', 'HCM-W02', 480, 100),
(5, 'Ho Chi Minh', 'HCM-W03', 420, 80),
(5, 'Hanoi', 'HN-W01', 450, 80),
(5, 'Hanoi', 'HN-W02', 420, 80),
(5, 'Hanoi', 'HN-W03', 340, 60),
(5, 'Da Nang', 'DN-W01', 380, 70),
(5, 'Da Nang', 'DN-W02', 320, 60),

-- Product 6: Ghế công thái học
(6, 'London', 'LON-W01', 150, 30),
(6, 'London', 'LON-W02', 170, 30),
(6, 'London', 'LON-W03', 100, 25),
(6, 'Epstein Island', 'EPI-W01', 110, 25),
(6, 'Epstein Island', 'EPI-W02', 140, 30),
(6, 'Ho Chi Minh', 'HCM-W01', 320, 60),
(6, 'Ho Chi Minh', 'HCM-W02', 290, 60),
(6, 'Ho Chi Minh', 'HCM-W03', 260, 50),
(6, 'Hanoi', 'HN-W01', 280, 50),
(6, 'Hanoi', 'HN-W02', 260, 50),
(6, 'Hanoi', 'HN-W03', 210, 40),
(6, 'Da Nang', 'DN-W01', 240, 45),
(6, 'Da Nang', 'DN-W02', 200, 40),

-- Product 7: Micro họp trực tuyến
(7, 'London', 'LON-W01', 220, 40),
(7, 'London', 'LON-W02', 250, 40),
(7, 'London', 'LON-W03', 150, 30),
(7, 'Epstein Island', 'EPI-W01', 170, 35),
(7, 'Epstein Island', 'EPI-W02', 210, 45),
(7, 'Ho Chi Minh', 'HCM-W01', 410, 80),
(7, 'Ho Chi Minh', 'HCM-W02', 380, 80),
(7, 'Ho Chi Minh', 'HCM-W03', 340, 70),
(7, 'Hanoi', 'HN-W01', 360, 70),
(7, 'Hanoi', 'HN-W02', 340, 70),
(7, 'Hanoi', 'HN-W03', 280, 50),
(7, 'Da Nang', 'DN-W01', 320, 60),
(7, 'Da Nang', 'DN-W02', 270, 50),

-- Product 8: Server Blade System
(8, 'London', 'LON-W01', 3, 1),
(8, 'London', 'LON-W02', 2, 1),
(8, 'Epstein Island', 'EPI-W01', 2, 1),
(8, 'Ho Chi Minh', 'HCM-W01', 5, 2),
(8, 'Ho Chi Minh', 'HCM-W02', 4, 2),
(8, 'Hanoi', 'HN-W01', 4, 2),
(8, 'Hanoi', 'HN-W02', 3, 1),
(8, 'Da Nang', 'DN-W01', 2, 1),

-- Product 9: Máy quét thẻ nhân viên
(9, 'London', 'LON-W01', 380, 70),
(9, 'London', 'LON-W02', 420, 70),
(9, 'London', 'LON-W03', 250, 50),
(9, 'Epstein Island', 'EPI-W01', 310, 60),
(9, 'Epstein Island', 'EPI-W02', 380, 70),
(9, 'Ho Chi Minh', 'HCM-W01', 720, 120),
(9, 'Ho Chi Minh', 'HCM-W02', 680, 120),
(9, 'Ho Chi Minh', 'HCM-W03', 600, 100),
(9, 'Hanoi', 'HN-W01', 650, 100),
(9, 'Hanoi', 'HN-W02', 620, 100),
(9, 'Hanoi', 'HN-W03', 500, 80),
(9, 'Da Nang', 'DN-W01', 580, 100),
(9, 'Da Nang', 'DN-W02', 490, 80),

-- Product 10: Tai nghe chống ồn
(10, 'London', 'LON-W01', 340, 60),
(10, 'London', 'LON-W02', 380, 60),
(10, 'London', 'LON-W03', 230, 50),
(10, 'Epstein Island', 'EPI-W01', 280, 55),
(10, 'Epstein Island', 'EPI-W02', 340, 65),
(10, 'Ho Chi Minh', 'HCM-W01', 650, 120),
(10, 'Ho Chi Minh', 'HCM-W02', 610, 120),
(10, 'Ho Chi Minh', 'HCM-W03', 540, 100),
(10, 'Hanoi', 'HN-W01', 590, 100),
(10, 'Hanoi', 'HN-W02', 560, 100),
(10, 'Hanoi', 'HN-W03', 450, 80),
(10, 'Da Nang', 'DN-W01', 520, 90),
(10, 'Da Nang', 'DN-W02', 440, 80);

-- 7. CART
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 8. WISHLIST
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 5. REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. DOCUMENTS
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    filename VARCHAR(200),
    department VARCHAR(100),
    access_level VARCHAR(20) CHECK (access_level IN ('public','internal','confidential','secret')),
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    file_size_kb INT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO documents (name, filename, department, access_level, uploaded_by, file_size_kb) VALUES
('Chính sách công ty', 'policy.pdf', 'HR', 'internal', 3, 48),
('Mẫu hợp đồng', 'contract_template.docx', 'Legal', 'internal', 3, 92),
('Hướng dẫn nội bộ', 'internal_guidelines.txt', 'Operations', 'public', 2, 28);
