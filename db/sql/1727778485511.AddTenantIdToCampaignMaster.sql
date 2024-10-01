ALTER TABLE "campaignMaster"
ADD COLUMN tenantId INTEGER NOT NULL;

ALTER TABLE "campaignMaster"
RENAME COLUMN "rule" TO "rules";