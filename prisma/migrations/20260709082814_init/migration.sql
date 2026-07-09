-- CreateTable
CREATE TABLE "versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "submenus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "submenus_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_id" INTEGER,
    "case_code" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "submenu" TEXT,
    "check_item" TEXT NOT NULL,
    "check_method" TEXT,
    "expected_result" TEXT,
    "actual_result" TEXT,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "test_cases_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_runs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version_id" INTEGER NOT NULL,
    "run_name" TEXT NOT NULL,
    "target_menu" TEXT,
    "status" TEXT NOT NULL,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_runs_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_run_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "test_run_id" INTEGER NOT NULL,
    "test_case_id" INTEGER NOT NULL,
    "result" TEXT,
    "executed_at" DATETIME,
    CONSTRAINT "test_run_items_test_run_id_fkey" FOREIGN KEY ("test_run_id") REFERENCES "test_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_run_items_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "issues" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "redmine_issue_id" TEXT,
    "title" TEXT NOT NULL,
    "menu" TEXT,
    "severity" TEXT,
    "assignee" TEXT,
    "created_on" DATETIME NOT NULL,
    "week_start" DATETIME NOT NULL,
    "week_end" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'tester',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "versions_version_name_key" ON "versions"("version_name");

-- CreateIndex
CREATE UNIQUE INDEX "submenus_version_id_name_key" ON "submenus"("version_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "test_cases_version_id_case_code_key" ON "test_cases"("version_id", "case_code");

-- CreateIndex
CREATE UNIQUE INDEX "test_run_items_test_run_id_test_case_id_key" ON "test_run_items"("test_run_id", "test_case_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");
