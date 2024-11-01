ALTER TABLE "templateContent"
DROP CONSTRAINT "templateContent_contentType_check";

ALTER TABLE "templateContent"
ADD CONSTRAINT "templateContent_contentType_check" CHECK ("contentType" IN ('text', 'image', 'video','file', 'common', 'carousel'));