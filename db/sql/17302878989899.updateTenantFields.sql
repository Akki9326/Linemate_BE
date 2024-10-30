ALTER TABLE "tenant"
ALTER COLUMN "isdCode" DROP NOT NULL;

ALTER TABLE "tenant"
ALTER COLUMN "logo" DROP NOT NULL;

ALTER TABLE "tenant"
ALTER COLUMN "whitelistedIps" DROP DEFAULT;
UPDATE "tenant" SET "whitelistedIps" = NULL;

ALTER TABLE "tenant"
ALTER COLUMN "whitelistedIps" TYPE TEXT[] USING "whitelistedIps"::TEXT[];