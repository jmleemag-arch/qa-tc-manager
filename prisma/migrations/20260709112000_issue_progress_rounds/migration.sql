-- CreateTable
CREATE TABLE "issue_progress_rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "week_of_month" INTEGER NOT NULL,
    "thursday_date" DATETIME NOT NULL,
    "total" INTEGER,
    "in_progress" INTEGER,
    "new_count" INTEGER,
    "status" TEXT NOT NULL DEFAULT '미작성',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "issue_progress_rounds_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "issue_progress_rounds_version_id_year_month_week_of_month_key" ON "issue_progress_rounds"("version_id", "year", "month", "week_of_month");

-- DropTable
DROP TABLE "issue_progress_snapshots";
