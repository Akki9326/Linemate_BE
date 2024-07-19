-- -- First, drop the existing column
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS permissions_type_check;

UPDATE permissions
SET "type" = 'platform'
WHERE "type" NOT IN ('tenant', 'platform');

ALTER TABLE "permissions"
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "type" SET DEFAULT 'platform',
ADD CHECK ("type" IN ('tenant', 'platform'));

-- -- Example Data Insertion
INSERT INTO permissions (
    "name", "type", "parentId", "description", "isActive", "isDeleted", "createdAt"
) VALUES (
    'user.read', 'platform', NULL, 'Allows read access', true, false, now()
);
INSERT INTO permissions (
    "name", "type", "parentId", "description", "isActive", "isDeleted", "createdAt"
) VALUES (
    'user.write', 'platform', NULL, 'Allows write access', true, false, now()
);
INSERT INTO permissions (
    "name", "type", "parentId", "description", "isActive", "isDeleted", "createdAt"
) VALUES (
    'variable.read', 'platform', NULL, 'Allows read access', true, false, now()
);
INSERT INTO permissions (
    "name", "type", "parentId", "description", "isActive", "isDeleted", "createdAt"
) VALUES (
    'variable.write', 'platform', NULL, 'Allows write access', true, false, now()
);


-- Drop the existing check constraint (if exists)
ALTER TABLE "role" DROP CONSTRAINT IF EXISTS role_type_check;

UPDATE "role"
SET "type" = 'custom'
WHERE "type" NOT IN ('custom', 'standard');

-- First, drop the existing column
ALTER TABLE "role"
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "type" SET DEFAULT 'standard',
ADD CHECK ("type" IN ('custom', 'standard'));

ALTER TABLE tenant
ADD COLUMN IF NOT EXISTS "whatsapp" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sms" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "viber" BOOLEAN DEFAULT false;




