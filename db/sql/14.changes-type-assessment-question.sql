ALTER TABLE "assessmentMaster"
ADD COLUMN "timeType" VARCHAR(50);

ALTER TABLE "assessmentOption"
ADD COLUMN "isCorrectAnswer" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "assessmentQuestionMatrix"
DROP COLUMN "correctAnswer";
