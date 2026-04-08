-- PostgreSQL Version (compatible with the compose setup)

-- Drop existing tables
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS products CASCADE;
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

-- 4. PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    category VARCHAR(100),
    price DECIMAL(15,2),
    stock INT DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
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
