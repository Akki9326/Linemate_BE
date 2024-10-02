ALTER TABLE "templateContent"
ADD COLUMN "headerMediaHandle" TEXT NULL,
ADD COLUMN "headerMediaSample" TEXT NULL;

ALTER TABLE "templateContentCards"
ADD COLUMN "mediaHandle" TEXT NULL,
ADD COLUMN "mediaSample" TEXT NULL;