-- Rename CampaignMatrix table
ALTER TABLE "campaignMatrix"
RENAME TO "campaignAnalyticMatrix";

CREATE TABLE "campaignTriggerMatrix" (
    id SERIAL PRIMARY KEY,
    "campaignId" INTEGER NOT NULL,
    "fynoCampaignId" INTEGER NOT NULL,
    "firedOn" DATE,
    "fireType" VARCHAR(50) NOT NULL CHECK ("fireType" IN ('Automatic', 'Manual')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER
);

ALTER TABLE "campaignAnalyticMatrix"
ADD COLUMN "campaignTriggerMatrixId" INTEGER
CONSTRAINT "fk_campaignTriggerMatrixId" REFERENCES "campaignTriggerMatrix"("id");