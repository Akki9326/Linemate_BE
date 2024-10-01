CREATE TABLE "cohortsMaster" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "rules" JSONB,
    "tenantId" INTEGER NOT NULL
);

CREATE TABLE "cohortsMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "cohortId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT fk_cohortId FOREIGN KEY ("cohortId") REFERENCES "cohortsMaster"(id) ON DELETE CASCADE,
    CONSTRAINT fk_userId FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE
);