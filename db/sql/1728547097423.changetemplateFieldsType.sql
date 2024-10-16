ALTER TABLE "templateContent"
ALTER COLUMN "locationName" TYPE TEXT,
ALTER COLUMN "address" TYPE TEXT,
ALTER COLUMN "messageText" TYPE TEXT;

ALTER TABLE "templateContentButtons"
ALTER COLUMN "initialScreen" TYPE TEXT,
ALTER COLUMN "navigateScreen" TYPE TEXT;