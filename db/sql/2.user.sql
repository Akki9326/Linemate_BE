CREATE TABLE users (
    id SERIAL PRIMARY KEY,
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
    is_temporary_password BOOLEAN DEFAULT false
);

-- Example user data
INSERT INTO users (
    username, email, password, first_name, last_name, mobile_number,
    tenant_ids, failed_login_attempts, last_logged_in_at, user_type, is_locked, is_temporary_password
) VALUES (
    'Manjari', 'Manjari@linemate.ai', 'Admin@123', 'Manjari', 'Manjari', '8860636099',
    ARRAY[], 0, "", '1', false, false
);

