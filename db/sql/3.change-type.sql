-- -- First, drop the existing column
ALTER TABLE permissions
DROP COLUMN "type";

-- -- Then, add the new column with a check constraint and default value
ALTER TABLE permissions
ADD COLUMN "type" VARCHAR(50) NOT NULL DEFAULT 'platform' CHECK ("type" IN ('tenant', 'platform'));

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


-- First, drop the existing column
ALTER TABLE "role"
DROP COLUMN "type";

-- Then, add the new column with a check constraint and default value
ALTER TABLE "role"
ADD COLUMN "type" VARCHAR(50) NOT NULL DEFAULT 'stander' CHECK ("type" IN ('custom', 'stander'));


ALTER TABLE tenant
ADD COLUMN "notificationsPermission" JSONB




