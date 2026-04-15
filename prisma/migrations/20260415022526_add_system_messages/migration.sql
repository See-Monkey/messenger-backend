-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('USER_ADDED', 'USER_LEFT');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "meta" JSONB,
ADD COLUMN     "systemType" "SystemType",
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'USER',
ALTER COLUMN "content" DROP NOT NULL;
