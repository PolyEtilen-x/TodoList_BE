-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "isImportant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMyDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listId" TEXT;

-- CreateTable
CREATE TABLE "TodoGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Todo_listId_idx" ON "Todo"("listId");

-- CreateIndex
CREATE INDEX "Todo_isImportant_idx" ON "Todo"("isImportant");

-- CreateIndex
CREATE INDEX "Todo_isMyDay_idx" ON "Todo"("isMyDay");

-- AddForeignKey
ALTER TABLE "TodoList" ADD CONSTRAINT "TodoList_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TodoGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_listId_fkey" FOREIGN KEY ("listId") REFERENCES "TodoList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
