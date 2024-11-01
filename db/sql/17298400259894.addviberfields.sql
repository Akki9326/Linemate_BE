ALTER TABLE "templateContent"
ADD COLUMN "thumbnailUrl" TEXT NULL,
ADD COLUMN "mediaDuration" VARCHAR(20) NULL;

ALTER TABLE "templateContent"
DROP CONSTRAINT "templateContent_contentType_check";

ALTER TABLE "templateContent"
ADD CONSTRAINT "templateContent_contentType_check" CHECK ("contentType" IN ('text', 'image', 'video', 'common', 'carousel'));