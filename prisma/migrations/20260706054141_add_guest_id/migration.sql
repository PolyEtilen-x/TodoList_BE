-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "TodoGroup" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "TodoList" ADD COLUMN     "guestId" TEXT;

-- CreateIndex
CREATE INDEX "Todo_guestId_idx" ON "Todo"("guestId");
