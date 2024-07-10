CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "isdCode" VARCHAR(50) NOT NULL
);


INSERT INTO countries ("name", "isdCode") VALUES ('India', '+91');
INSERT INTO countries ("name", "isdCode") VALUES ('Philippines', '+63');


-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,    
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "mobileNumber" VARCHAR(20),
    "tenantIds" INTEGER[],
    "failedLoginAttempts" INTEGER DEFAULT 0,
    "lastLoggedInAt" TIMESTAMP,
    "userType" VARCHAR(50),
    "isLocked" BOOLEAN DEFAULT false,
    "isTemporaryPassword" BOOLEAN DEFAULT false,
    "countryCode" VARCHAR(50),
    "employeeId" VARCHAR(26),
    "profilePhoto" VARCHAR(255)
);

-- Insert user data with bcrypt hashed password
INSERT INTO users (
    "email", "password", "firstName", "lastName", "mobileNumber",
    "tenantIds", "failedLoginAttempts", "lastLoggedInAt", "userType", "isLocked", "isTemporaryPassword", "countryCode"
) VALUES (
    'akash@codiot', crypt('Admin@123', gen_salt('bf')), 'Akash', 'Akash', '8866104284',
    ARRAY[]::integer[], 0, NULL, 'Chief Admin', false, false, '+91'
);



-- Create permissions Table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "type" VARCHAR(50) NOT NULL CHECK (type IN ('READ', 'WRITE', 'DELETE')), 
    "parentId" INTEGER,
    "description" VARCHAR(255)
);

-- Example Data Insertion
INSERT INTO permissions (
    "name", "type", "parentId", "description"
) VALUES (
    'Read Permission', 'READ', NULL, 'Allows read access'
);


-- -- Create Role Table
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL CHECK (type IN ('Super Admin', 'Tenant Admin', 'User', 'Chief Admin')), 
    "permissionsIds" INTEGER[],
    "userIds" INTEGER[],
    "tenantId" INTEGER
);

-- Example Data Insertion
INSERT INTO role (
    "name", "description", "type", "permissionsIds", "userIds"
) VALUES (
    'Admin Role', 'Admin role description', 'Chief Admin', ARRAY[]::integer[], ARRAY[]::integer[]
);


CREATE TABLE "userType" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "type" VARCHAR(100) NOT NULL,
    "roleId" INTEGER
);

-- Example Data Insertion
INSERT INTO "userType" (
    type, "roleId"
) VALUES (
    'ChiefAdmin', 1
);


-- Create Tenant Table
CREATE TABLE tenant (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,    
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "companyType" VARCHAR(100) NOT NULL,
    "trademark" VARCHAR(255) NOT NULL UNIQUE,
    "phoneNumber" VARCHAR(20),
    "logo" VARCHAR(255) NOT NULL,
    "gstNumber" VARCHAR(255) NOT NULL UNIQUE,
    "currencyCode" VARCHAR(255) NOT NULL,
    "isdCode" VARCHAR(255),
    "clientType" VARCHAR(255),
    "authorisedFirstName" VARCHAR(100),
    "authorisedLastName" VARCHAR(100),
    "authorisedEmail" VARCHAR(100),
    "authorisedMobileNo" VARCHAR(100),
    "companyAddress" VARCHAR(100),
    "companyCountry" VARCHAR(100),
    "companyState" VARCHAR(100),
    "companyCity" VARCHAR(100),
    "companyPinCode" VARCHAR(50),
    "whitelistedIps" VARCHAR(50)
);



CREATE TABLE "usersPasswords" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255),
    "userId" VARCHAR
);


CREATE TABLE "userToken" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "token" VARCHAR(255),
    "tokenType" VARCHAR(100),
    "expiresAt" TIMESTAMP,
    "retryCount" INTEGER
);