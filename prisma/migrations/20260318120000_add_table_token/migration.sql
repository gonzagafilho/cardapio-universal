-- Table.token (entrada pública por mesa)
ALTER TABLE "Table" ADD COLUMN "token" TEXT;
CREATE UNIQUE INDEX "Table_establishmentId_token_key" ON "Table"("establishmentId", "token");

