ALTER TABLE "campaignMaster"
ADD COLUMN "channel_temp" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "campaignMaster"
SET "channel_temp" = ARRAY["channel"];

ALTER TABLE "campaignMaster"
DROP COLUMN "channel";

ALTER TABLE "campaignMaster"
RENAME COLUMN "channel_temp" TO "channel";

