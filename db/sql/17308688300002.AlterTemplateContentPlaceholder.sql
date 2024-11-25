ALTER TABLE "templateContent"
ALTER COLUMN "bodyPlaceHolder" TYPE TEXT[] USING "bodyPlaceHolder"::TEXT[];

ALTER TABLE "templateContent"
ALTER COLUMN "headerPlaceHolder" TYPE TEXT[] USING "headerPlaceHolder"::TEXT[];