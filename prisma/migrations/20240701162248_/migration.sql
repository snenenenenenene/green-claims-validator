/*
  Warnings:

  - You are about to drop the column `roles` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "roles";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" TEXT NOT NULL DEFAULT 'user';
