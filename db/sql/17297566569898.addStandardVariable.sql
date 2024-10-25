INSERT INTO "userVariableMaster" (
    "createdAt", "updatedAt", "createdBy", "updatedBy", "isActive", "isDeleted",
    "name", "isMandatory", "type", "description", "placeHolder", "category", "options", "tenantId"
) VALUES 
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0, TRUE, FALSE, 'reportToId   ', FALSE, 'numeric', '', 'Please Enter Report To', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0, TRUE, FALSE, 'role', FALSE, 'text', '', 'Please Enter Role', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0, TRUE, FALSE, 'joiningDate', FALSE, 'date', '', 'Please Enter Joining Date', 'standard', NULL, NULL);

-- Add new columns
ALTER TABLE "users"
ADD COLUMN "reportToId" INTEGER NULL;

ALTER TABLE "users"
ADD COLUMN "role" VARCHAR(50) NULL;

ALTER TABLE "users"
ADD COLUMN "joiningDate" TIMESTAMP NULL;

ALTER TABLE "users"
ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "users"
ALTER COLUMN "lastName" DROP NOT NULL;