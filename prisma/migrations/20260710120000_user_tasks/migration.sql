CREATE TABLE "user_tasks" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "user_id" INTEGER NOT NULL,
  "version_id" INTEGER,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "related_item" TEXT,
  "target_type" TEXT,
  "target_id" INTEGER,
  "priority" TEXT NOT NULL DEFAULT '보통',
  "status" TEXT NOT NULL DEFAULT '미처리',
  "requester" TEXT,
  "due_date" DATETIME,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_tasks_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
