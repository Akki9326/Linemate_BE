ALTER TABLE "templateContent"
ADD COLUMN "contentId" INTEGER NULL,
ADD CONSTRAINT fk_contentId FOREIGN KEY ("contentId") REFERENCES "contents"(id) ON DELETE CASCADE
