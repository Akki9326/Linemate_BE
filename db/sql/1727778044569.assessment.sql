CREATE TABLE "assessmentMaster" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "totalQuestion" INTEGER NOT NULL,
    "scoring" VARCHAR(50) NOT NULL CHECK ("scoring" IN ('max score', 'per question', 'no score')),
    "score" INTEGER,
    "timed" INTEGER,
    "pass" INTEGER NOT NULL
);

CREATE TABLE "assessmentQuestionMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "assessmentId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL CHECK ("type" IN ('multi select', 'single select', 'boolean', 'input')),
    "optionIds" INTEGER[],
    "correctAnswer" INTEGER,
    "score" INTEGER
);

CREATE TABLE "assessmentOption" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,
    "option" TEXT NOT NULL
);

CREATE TABLE "skillMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "contentId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL
);