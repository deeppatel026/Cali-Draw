-- Step 1: Add column as nullable
ALTER TABLE "Room" ADD COLUMN "name" TEXT;

-- Step 2: Backfill existing rows using slug as name
UPDATE "Room" SET "name" = "slug" WHERE "name" IS NULL;

-- Step 3: Make column NOT NULL
ALTER TABLE "Room" ALTER COLUMN "name" SET NOT NULL;
