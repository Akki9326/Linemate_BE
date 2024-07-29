-- changes type on user table 
-- Step 1: Add new integer columns
ALTER TABLE users ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE users ADD COLUMN "new_updatedBy" INTEGER;

-- Step 2: Transform data
UPDATE users 
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE users 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

-- Step 3: Drop the old varchar columns
ALTER TABLE users DROP COLUMN "createdBy";
ALTER TABLE users DROP COLUMN "updatedBy";

-- Step 4: Rename new integer columns to the original names
ALTER TABLE users RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE users RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('createdBy', 'updatedBy');


-- changes type on permission table to createdBy and updatedBy
ALTER TABLE permissions ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE permissions ADD COLUMN "new_updatedBy" INTEGER;

UPDATE permissions 
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE permissions 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE permissions DROP COLUMN "createdBy";
ALTER TABLE permissions DROP COLUMN "updatedBy";

ALTER TABLE permissions RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE permissions RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'permissions' AND column_name IN ('createdBy', 'updatedBy');


--  changes datatype of roles table in createdBy column and updatedBy column
ALTER TABLE role ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE role ADD COLUMN "new_updatedBy" INTEGER;

UPDATE role 
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE role 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE role DROP COLUMN "createdBy";
ALTER TABLE role DROP COLUMN "updatedBy";

ALTER TABLE role RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE role RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'role' AND column_name IN ('createdBy', 'updatedBy');


-- changes datatype of userType table in createdBy column and updatedBy column
ALTER TABLE "userType" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "userType" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "userType" 
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "userType" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "userType" DROP COLUMN "createdBy";
ALTER TABLE "userType" DROP COLUMN "updatedBy";

ALTER TABLE "userType" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "userType" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'userType' AND column_name IN ('createdBy', 'updatedBy');


-- change datatype of tenant table in createdBy column and updatedBy column
ALTER TABLE tenant ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE tenant ADD COLUMN "new_updatedBy" INTEGER;

UPDATE tenant
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE tenant 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE tenant DROP COLUMN "createdBy";
ALTER TABLE tenant DROP COLUMN "updatedBy";

ALTER TABLE tenant RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE tenant RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenant' AND column_name IN ('createdBy', 'updatedBy');


-- change datatype of usersPassword table in createdBy column and updatedBy column
ALTER TABLE "usersPasswords" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "usersPasswords" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "usersPasswords"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "usersPasswords" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "usersPasswords" DROP COLUMN "createdBy";
ALTER TABLE "usersPasswords" DROP COLUMN "updatedBy";

ALTER TABLE "usersPasswords" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "usersPasswords" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usersPasswords' AND column_name IN ('createdBy', 'updatedBy');



-- change datatype of userToken table in createdBy column and updatedBy column
ALTER TABLE "userToken" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "userToken" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "userToken"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "userToken" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "userToken" DROP COLUMN "createdBy";
ALTER TABLE "userToken" DROP COLUMN "updatedBy";

ALTER TABLE "userToken" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "userToken" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'userToken' AND column_name IN ('createdBy', 'updatedBy');


-- change datatype of userVariableMaster table in createdBy column and updatedBy column
ALTER TABLE "userVariableMaster" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "userVariableMaster" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "userVariableMaster"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "userVariableMaster" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "userVariableMaster" DROP COLUMN "createdBy";
ALTER TABLE "userVariableMaster" DROP COLUMN "updatedBy";

ALTER TABLE "userVariableMaster" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "userVariableMaster" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'userVariableMaster' AND column_name IN ('createdBy', 'updatedBy');


-- change datatype of userVariableMatrix table in createdBy column and updatedBy column
ALTER TABLE "userVariableMatrix" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "userVariableMatrix" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "userVariableMatrix"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "userVariableMatrix" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "userVariableMatrix" DROP COLUMN "createdBy";
ALTER TABLE "userVariableMatrix" DROP COLUMN "updatedBy";

ALTER TABLE "userVariableMatrix" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "userVariableMatrix" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'userVariableMatrix' AND column_name IN ('createdBy', 'updatedBy');



-- change datatype of contents table in createdBy column and updatedBy column
ALTER TABLE "contents" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "contents" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "contents"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "contents" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "contents" DROP COLUMN "createdBy";
ALTER TABLE "contents" DROP COLUMN "updatedBy";

ALTER TABLE "contents" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "contents" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contents' AND column_name IN ('createdBy', 'updatedBy');



-- change datatype of uploadedFiles table in createdBy column and updatedBy column
ALTER TABLE "uploadedFiles" ADD COLUMN "new_createdBy" INTEGER;
ALTER TABLE "uploadedFiles" ADD COLUMN "new_updatedBy" INTEGER;

UPDATE "uploadedFiles"
SET "new_createdBy" = CASE 
    WHEN LOWER(CAST("createdBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("createdBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("createdBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

UPDATE "uploadedFiles" 
SET "new_updatedBy" = CASE 
    WHEN LOWER(CAST("updatedBy" AS TEXT)) = 'system' THEN 0 
    WHEN (CAST("updatedBy" AS TEXT) ~ '^[0-9]+$') THEN CAST(CAST("updatedBy" AS TEXT) AS INTEGER) 
    ELSE NULL 
END;

ALTER TABLE "uploadedFiles" DROP COLUMN "createdBy";
ALTER TABLE "uploadedFiles" DROP COLUMN "updatedBy";

ALTER TABLE "uploadedFiles" RENAME COLUMN "new_createdBy" TO "createdBy";
ALTER TABLE "uploadedFiles" RENAME COLUMN "new_updatedBy" TO "updatedBy";

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'uploadedFiles' AND column_name IN ('createdBy', 'updatedBy');