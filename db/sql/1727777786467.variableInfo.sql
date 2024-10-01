CREATE TABLE "userVariableMaster" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "isMandatory" BOOLEAN DEFAULT false,
    "type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "placeHolder" VARCHAR(255),
    "category" VARCHAR(255) NOT NULL,
    "options" TEXT[],
    "tenantId" INTEGER NOT NULL
);

CREATE TABLE "userVariableMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL DEFAULT 'System',
    "updatedBy" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "variableId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL
);