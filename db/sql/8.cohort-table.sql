CREATE TABLE "cohorts" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "tenantId" INTEGER,
    "userIds" INTEGER[]
);