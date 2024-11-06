ALTER TABLE "campaignTriggerMatrix"
DROP COLUMN "fynoCampaignId";

ALTER TABLE "campaignTriggerMatrix"
ADD COLUMN "fynoCampaignId" varchar(255);

