-- AlterTable
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_issues" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "redmine_issue_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "project" TEXT,
    "menu" TEXT,
    "priority" TEXT,
    "severity" TEXT,
    "assignee" TEXT,
    "redmine_status" TEXT NOT NULL DEFAULT '대기',
    "redmine_url" TEXT,
    "redmine_error" TEXT,
    "created_on" DATETIME NOT NULL,
    "round_year" INTEGER,
    "round_month" INTEGER,
    "round_week" INTEGER,
    "thursday_date" DATETIME,
    "week_start" DATETIME NOT NULL,
    "week_end" DATETIME NOT NULL
);

INSERT INTO "new_issues" (
    "id",
    "redmine_issue_id",
    "title",
    "menu",
    "severity",
    "assignee",
    "redmine_status",
    "created_on",
    "week_start",
    "week_end"
)
SELECT
    "id",
    "redmine_issue_id",
    "title",
    "menu",
    "severity",
    "assignee",
    CASE
        WHEN "redmine_issue_id" IS NOT NULL AND "redmine_issue_id" != '' THEN '등록완료'
        ELSE '등록완료'
    END,
    "created_on",
    "week_start",
    "week_end"
FROM "issues";

DROP TABLE "issues";
ALTER TABLE "new_issues" RENAME TO "issues";

PRAGMA foreign_keys=ON;
