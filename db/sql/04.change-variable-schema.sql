ALTER TABLE "userVariableMaster"
ALTER COLUMN "tenantId" DROP NOT NULL;

ALTER TABLE "userVariableMaster"
ALTER COLUMN "type" SET DEFAULT 'text';

ALTER TABLE "userVariableMaster"
ADD CHECK ("type" IN ('text', 'multiSelect', 'numeric', 'singleSelect'));

ALTER TABLE "userVariableMaster"
ALTER COLUMN "category" SET DEFAULT 'custom';

ALTER TABLE "userVariableMaster"
ADD CHECK ("category" IN ('custom', 'standard'));

INSERT INTO "userVariableMaster" (
    "createdAt", "updatedAt", "createdBy", "updatedBy", "isActive", "isDeleted",
    "name", "isMandatory", "type", "description", "placeHolder", "category", "options", "tenantId"
) VALUES 
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System', 'System', TRUE, FALSE, 'firstName', TRUE, 'text', '', 'Please Enter First Name', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System', 'System', TRUE, FALSE, 'lastName', TRUE, 'text', '', 'Please Enter Last Name', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System', 'System', TRUE, FALSE, 'email', TRUE, 'text', '', 'Please Enter Email', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System', 'System', TRUE, FALSE, 'mobileNumber', TRUE, 'numeric', '', 'Please Enter Mobile Number', 'standard', NULL, NULL),
    (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System', 'System', TRUE, FALSE, 'employeeId', FALSE, 'text', '', 'Please Enter Employee Id', 'standard', NULL, NULL);