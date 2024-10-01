-- Step 1: Drop the existing CHECK constraint
ALTER TABLE "contents" 
DROP CONSTRAINT contents_type_check;  -- Replace with your actual constraint name

-- Step 2: Add the new CHECK constraint
ALTER TABLE "contents"
ADD CONSTRAINT contents_type_check 
CHECK (type IN ('PDF', 'document', 'video', 'powerPoint', 'scorm', 'assessment'));

-- Step 3: Add the new column assessmentId
ALTER TABLE "contents" 
ADD COLUMN "assessmentId" INTEGER;
