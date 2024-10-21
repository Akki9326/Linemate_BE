CREATE TABLE "workSpace" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "fynoWorkSpaceId" VARCHAR(20),  
    "fynoWorkSpaceName" VARCHAR(20), 
    "tenantId" INTEGER NOT NULL,
    CONSTRAINT fk_tenantId FOREIGN KEY ("tenantId") REFERENCES "tenant"(id) ON DELETE CASCADE
);

CREATE TABLE "communication" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "fromNumber" VARCHAR(20),  
    "wabaId" VARCHAR(20),  
    "integrationId" VARCHAR(20),  
    "customName" VARCHAR(100) NOT NULL,
    "channel" VARCHAR(10) CHECK ("channel" IN ('whatsapp', 'SMS', 'viber')),
    "viberProvider" VARCHAR(20), 
    "domain" TEXT, 
    "sender" VARCHAR(20),
    "accessToken" TEXT, 
    "workSpaceId" INTEGER NOT NULL,
    CONSTRAINT fk_workSpaceId FOREIGN KEY ("workSpaceId") REFERENCES "workSpace"(id) ON DELETE CASCADE
);