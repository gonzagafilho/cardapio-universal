-- AlterTable TableSession: add totalAmount (nullable, total consolidado ao fechar)
ALTER TABLE "TableSession" ADD COLUMN "totalAmount" DECIMAL(10,2);
