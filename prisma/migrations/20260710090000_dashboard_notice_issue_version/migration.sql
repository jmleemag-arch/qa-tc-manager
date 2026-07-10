ALTER TABLE "issues" ADD COLUMN "version_id" INTEGER;

UPDATE "issues"
SET "version_id" = (
  SELECT "id"
  FROM "versions"
  ORDER BY
    CASE
      WHEN lower("status") IN ('active', 'in_progress') THEN 0
      WHEN "status" LIKE '%활성%' THEN 0
      WHEN "status" LIKE '%진행%' THEN 0
      ELSE 1
    END,
    "created_at" DESC,
    "id" DESC
  LIMIT 1
)
WHERE "version_id" IS NULL;

CREATE TABLE "notices" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "category" TEXT NOT NULL DEFAULT '공지',
  "title" TEXT NOT NULL,
  "content" TEXT,
  "created_by" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
