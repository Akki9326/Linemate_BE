CREATE TABLE "campaignUserMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT fk_campaignId FOREIGN KEY ("campaignId") REFERENCES "campaignMaster"(id) ON DELETE CASCADE,
    CONSTRAINT fk_userId FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE
);