-- CreateTable
CREATE TABLE "issue_progress_snapshots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_id" INTEGER NOT NULL,
    "snapshot_date" DATETIME NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "inProgress" INTEGER NOT NULL DEFAULT 0,
    "new_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "issue_progress_snapshots_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "issue_progress_snapshots_version_id_snapshot_date_key" ON "issue_progress_snapshots"("version_id", "snapshot_date");
