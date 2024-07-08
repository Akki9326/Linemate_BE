CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    isd_code VARCHAR(50) NOT NULL
);


INSERT INTO countries (name, isd_code) VALUES ('India', '+91');
INSERT INTO countries (name, isd_code) VALUES ('Philippines', '+63');


-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    createdBy VARCHAR(100) NOT NULL DEFAULT 'System',
    updatedBy VARCHAR(100),
    isActive BOOLEAN NOT NULL DEFAULT true,
    isDeleted BOOLEAN NOT NULL DEFAULT false,    
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    mobile_number VARCHAR(20),
    tenant_ids INTEGER[],
    failed_login_attempts INTEGER DEFAULT 0,
    last_logged_in_at TIMESTAMP,
    user_type VARCHAR(50),
    is_locked BOOLEAN DEFAULT false,
    is_temporary_password BOOLEAN DEFAULT false,
    countryCode VARCHAR(50)
);

-- Insert user data with bcrypt hashed password
INSERT INTO users (
    username, email, password, first_name, last_name, mobile_number,
    tenant_ids, failed_login_attempts, last_logged_in_at, user_type, is_locked, is_temporary_password, countryCode
) VALUES (
    'Akash', 'akash@codiot', crypt('Admin@123', gen_salt('bf')), 'Akash', 'Akash', '8866104284',
    ARRAY[]::integer[], 0, NULL, 'Chief Admin', false, false, '+91'
);



-- Create permissions Table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    createdBy VARCHAR(100) NOT NULL DEFAULT 'System',
    updatedBy VARCHAR(100),
    isActive BOOLEAN NOT NULL DEFAULT true,
    isDeleted BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('READ', 'WRITE', 'DELETE')), 
    parent_id INTEGER,
    description VARCHAR(255)
);

-- Example Data Insertion
INSERT INTO permissions (
    name, type, parent_id, description
) VALUES (
    'Read Permission', 'READ', NULL, 'Allows read access'
);


-- -- Create Role Table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    createdBy VARCHAR(100) NOT NULL DEFAULT 'System',
    updatedBy VARCHAR(100),
    isActive BOOLEAN NOT NULL DEFAULT true,
    isDeleted BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Super Admin', 'Tenant Admin', 'User', 'ChiefAdmin')), 
    permissions_ids INTEGER[],
    user_ids INTEGER[],
    tenant_id INTEGER
);

-- Example Data Insertion
INSERT INTO role (
    name, description, type, permissions_ids, user_ids
) VALUES (
    'Admin Role', 'Admin role description', 'ChiefAdmin', ARRAY[]::integer[], ARRAY[]::integer[]
);


CREATE TABLE userType (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP,
    createdBy VARCHAR(100) NOT NULL DEFAULT 'System',
    updatedBy VARCHAR(100),
    isActive BOOLEAN NOT NULL DEFAULT true,
    isDeleted BOOLEAN NOT NULL DEFAULT false,
    type VARCHAR(100) NOT NULL,
    roleId INTEGER
);

-- Example Data Insertion
INSERT INTO userType (
    type, roleId
) VALUES (
    'ChiefAdmin', 1
);