-- First, drop the existing column
ALTER TABLE permissions
DROP COLUMN "type";

-- Then, add the new column with a check constraint and default value
ALTER TABLE permissions
ADD COLUMN "type" VARCHAR(50) NOT NULL DEFAULT 'platform' CHECK ("type" IN ('tenant', 'platform'));

-- First, drop the existing column
ALTER TABLE role
DROP COLUMN "type";

-- Then, add the new column with a check constraint and default value
ALTER TABLE role
ADD COLUMN "type" VARCHAR(50) NOT NULL DEFAULT 'stander' CHECK ("type" IN ('custom', 'stander'));


ALTER TABLE tenant
ADD COLUMN "notificationsPermission" JSONB NOT NULL 

