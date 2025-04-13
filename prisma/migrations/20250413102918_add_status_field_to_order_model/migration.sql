-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DELIVERING', 'DELIVERED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'DELIVERING';
