-- Add count column with default value of 1
ALTER TABLE "CardCollection" ADD COLUMN "count" INTEGER NOT NULL DEFAULT 1;

-- Convert owned boolean to count: true -> 1, false -> 0
UPDATE "CardCollection" SET "count" = CASE WHEN "owned" = true THEN 1 ELSE 0 END;

-- Add updatedAt column with default
ALTER TABLE "CardCollection" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop the owned column
ALTER TABLE "CardCollection" DROP COLUMN "owned";
