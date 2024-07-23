CREATE TABLE "contents" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(20) NOT NULL ,
    "updatedBy" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) NOT NULL CHECK (type IN ('PDF', 'Document', 'Video', 'PowerPoint', 'Scorm')), 
    "description" VARCHAR(255),
    "tenantId" INTEGER,
    "uploadedFileIds" INTEGER[],
    "isPublish" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "uploadedFiles" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" VARCHAR(20) NOT NULL ,
    "updatedBy" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "size" INTEGER,
    "s3Key" VARCHAR(255) NOT NULL
);