-- -- First, drop the existing column

Delete from "permissions";
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS permissions_type_check;

ALTER TABLE "permissions"
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "type" SET DEFAULT 'platform',
ADD CHECK ("type" IN ('tenant', 'platform'));

-- -- Example Data Insertion
INSERT INTO permissions (
    "name", "type", "parentId", "description"
) VALUES (
    'user.read', 'platform', NULL, 'Allows read access'
);
INSERT INTO permissions (
    "name", "type", "parentId", "description"
) VALUES (
    'user.write', 'platform', NULL, 'Allows write access'
);
INSERT INTO permissions (
    "name", "type", "parentId", "description"
) VALUES (
    'variable.read', 'platform', NULL, 'Allows read access'
);
INSERT INTO permissions (
    "name", "type", "parentId", "description"
) VALUES (
    'variable.write', 'platform', NULL, 'Allows write access'
);



Delete from "role";
-- Drop the existing check constraint (if exists)
ALTER TABLE "role" DROP CONSTRAINT IF EXISTS role_type_check;

-- First, drop the existing column
ALTER TABLE "role"
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "type" SET DEFAULT 'standard',
ADD CHECK ("type" IN ('custom', 'standard'));

ALTER TABLE tenant
ADD COLUMN "whatsapp" BOOLEAN DEFAULT false,
ADD COLUMN "sms" BOOLEAN DEFAULT false,
ADD COLUMN "viber" BOOLEAN DEFAULT false




