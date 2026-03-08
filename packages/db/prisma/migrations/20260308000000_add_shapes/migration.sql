-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "Shape" (
    "id"        TEXT         NOT NULL,
    "type"      TEXT         NOT NULL,
    "data"      TEXT         NOT NULL,
    "roomId"    INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shape_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if table was just created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Shape_roomId_fkey'
  ) THEN
    ALTER TABLE "Shape"
      ADD CONSTRAINT "Shape_roomId_fkey"
      FOREIGN KEY ("roomId") REFERENCES "Room"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;
