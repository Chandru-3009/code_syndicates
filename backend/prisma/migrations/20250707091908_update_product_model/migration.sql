-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "internalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "ean" BIGINT,
    "color" TEXT,
    "size" TEXT,
    "availability" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_internalId_key" ON "Product"("internalId");
