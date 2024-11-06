CREATE TABLE "assessmentResult" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,  
    "assessmentId" INTEGER NOT NULL, 
    "contentId" INTEGER NOT NULL, 
    "totalScore" INTEGER NULL, 
    "resultType" VARCHAR(10) NULL CHECK ("resultType" IN ('Pass', 'Fail')),
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NULL,
    "correctAnswerCount" INTEGER NULL,
    "wrongAnswerCount" INTEGER NULL,
    "unAttemptQuestionCount" INTEGER NULL,
    CONSTRAINT fk_userId FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE,
    CONSTRAINT fk_assessmentId FOREIGN KEY ("assessmentId") REFERENCES "assessmentMaster"(id) ON DELETE CASCADE,
    CONSTRAINT fk_contentId FOREIGN KEY ("contentId") REFERENCES "contents"(id) ON DELETE CASCADE
);

CREATE TABLE "assessmentAnswerMatrix" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,
    "createdBy" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "questionId" INTEGER NOT NULL,
    "userAnswerIds" INTEGER[] NOT NULL,
    "assessmentResultId" INTEGER NOT NULL,
    CONSTRAINT fk_questionId FOREIGN KEY ("questionId") REFERENCES "assessmentQuestionMatrix"(id) ON DELETE CASCADE,
    CONSTRAINT fk_assessResultId FOREIGN KEY ("assessmentResultId") REFERENCES "assessmentResult"(id) ON DELETE CASCADE
);
