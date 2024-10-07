-- Drop default values before changing column type
ALTER TABLE "campaignMaster" ALTER COLUMN "createdBy" DROP DEFAULT;
ALTER TABLE "campaignMaster" ALTER COLUMN "updatedBy" DROP DEFAULT;

-- Change the column type
ALTER TABLE "campaignMaster" ALTER COLUMN "createdBy" TYPE INTEGER USING "createdBy"::integer;
ALTER TABLE "campaignMaster" ALTER COLUMN "updatedBy" TYPE INTEGER USING "updatedBy"::integer;

