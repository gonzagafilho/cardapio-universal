-- Bloco 1: Order.tableId (mesa/comanda)
ALTER TABLE "Order" ADD COLUMN "tableId" TEXT;
CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Bloco 2: StoreSettings.minimumOrderAmountDelivery
ALTER TABLE "StoreSettings" ADD COLUMN "minimumOrderAmountDelivery" DECIMAL(10,2);

-- Bloco 3: Product.isAvailable
ALTER TABLE "Product" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;
