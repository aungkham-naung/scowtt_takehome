-- CreateTable
CREATE TABLE "facts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "movie" TEXT NOT NULL,
    "fact" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
