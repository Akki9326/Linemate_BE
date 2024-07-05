-- Create Role Table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'System',
    updated_by VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('admin', 'user')), -- Example values, adjust as per your enum
    permissions_ids INTEGER[] NOT NULL,
    user_ids INTEGER[],
    tenant_id INTEGER,
    CONSTRAINT fk_permissions FOREIGN KEY (permissions_ids) REFERENCES permissions(id),
    CONSTRAINT fk_users FOREIGN KEY (user_ids) REFERENCES users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

-- Example Data Insertion
INSERT INTO role (
    name, description, type, permissions_ids, user_ids, tenant_id
) VALUES (
    'Admin Role', 'Admin role description', 'admin', '{1, 2, 3}', '{1, 2}', 1
);

