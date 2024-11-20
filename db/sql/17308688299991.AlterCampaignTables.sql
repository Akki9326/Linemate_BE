ALTER TABLE public."campaignTriggerMatrix" ALTER COLUMN "firedOn" TYPE timestamp;
ALTER TABLE public."campaignMaster" ADD COLUMN "lastTriggerDate" timestamp NULL;
ALTER TABLE public."campaignMaster" ADD COLUMN "nextTriggerDate" timestamp NULL;