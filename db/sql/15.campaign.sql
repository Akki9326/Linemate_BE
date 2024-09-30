CREATE TABLE "campaignMaster" (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "channel" VARCHAR(50) NOT NULL CHECK ("channel" IN ('whatsapp', 'sms', 'viber')),
    "whatsappTemplateId" INTEGER,
    "viberTemplateId" INTEGER,
    "smsTemplateId" INTEGER,
    "rule" JSONB,
    "tags" TEXT[],
    "status" VARCHAR(50) NOT NULL CHECK ("status" IN ('completed', 'in-progress', 'failed')),
    "isArchived" BOOLEAN default false,
    "isActive" BOOLEAN NOT NULL default true,
    "isDeleted" BOOLEAN NOT NULL default false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(20) NOT NULL DEFAULT '', 
    "updatedBy" VARCHAR(20)
);


CREATE TABLE "campaignMatrix" (
    id SERIAL PRIMARY KEY,
    "triggerType" VARCHAR(50) NOT NULL CHECK ("triggerType" IN ('Manual', 'Automatic')),
    "campaignId" INTEGER NOT NULL,    
    "triggered" INTEGER,
    "delivered" INTEGER,
    "read" INTEGER,
    "clicked" INTEGER,
    "failed" INTEGER,
    "isActive" BOOLEAN NOT NULL default true,
    "isDeleted" BOOLEAN NOT NULL default false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(20) NOT NULL DEFAULT '', 
    "updatedBy" VARCHAR(20)
    CONSTRAINT fk_campaign_id FOREIGN KEY ("campaignId")
        REFERENCES "campaignMaster" (id)
        ON DELETE CASCADE
);   


ALTER TABLE "campaignMaster"
ADD COLUMN "reoccurenceType" VARCHAR(50)
ADD COLUMN "reoccurentDetails" JSONB