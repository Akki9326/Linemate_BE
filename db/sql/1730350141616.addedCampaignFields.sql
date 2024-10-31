ALTER TABLE "campaignTriggerMatrix"
ADD COLUMN "scheduleDate" DATE;

ALTER TABLE "campaignTriggerMatrix"
ADD COLUMN "isFired" BOOLEAN NOT NULL DEFAULT false;

