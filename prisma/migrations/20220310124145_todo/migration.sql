/*
  Warnings:

  - You are about to drop the column `userId` on the `todos` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_todos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "todo" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL
);
INSERT INTO "new_todos" ("completed", "createdAt", "id", "todo", "updatedAt") SELECT "completed", "createdAt", "id", "todo", "updatedAt" FROM "todos";
DROP TABLE "todos";
ALTER TABLE "new_todos" RENAME TO "todos";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
