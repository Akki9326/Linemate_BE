ALTER TABLE "campaignMaster"
DROP COLUMN tenantId;

ALTER TABLE "campaignMaster"
ADD COLUMN "tenantId" INTEGER NOT NULL;

ALTER TABLE "campaignMaster"
DROP COLUMN "reoccurentDetails";

ALTER TABLE "campaignMaster"
ADD COLUMN "reoccurenceDetails" JSONB;

ALTER TABLE "campaignMaster"
ADD COLUMN "deliveryStatus" INTEGER DEFAULT 0;