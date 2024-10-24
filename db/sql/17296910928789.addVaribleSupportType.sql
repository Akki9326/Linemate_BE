ALTER TABLE "userVariableMaster"
DROP CONSTRAINT "userVariableMaster_type_check";

ALTER TABLE "userVariableMaster"
ADD CONSTRAINT "userVariableMaster_type_check" CHECK ("type" IN ('text', 'multiSelect', 'numeric', 'singleSelect', 'email', 'phoneNumber', 'date'));