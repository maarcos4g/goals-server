import { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";
import { authentication } from "@/authentication";
import { db } from "@/db/connection";

enum TransactionType {
  DEPOSIT = "DEPOSIT",
  OUT = "OUT",
}

const transactionTypeValues: [string, string] = [TransactionType.DEPOSIT, TransactionType.OUT];

export async function createTransaction(app: FastifyInstance) {
  app.post('/transaction', {
    onRequest: [authentication]
  },
    async ({ body }, { send, statusCode }) => {
      try {
        const createTransactionSchema = z.object({
          type: z.enum(transactionTypeValues).default(TransactionType.OUT),
          value: z.number().default(0.0),
          goalId: z.string().cuid(),
        })

        const { value, type, goalId } = createTransactionSchema.parse(body)


        const transaction = await db.transaction.create({
          data: {
            value,
            goalId,
            type: type as TransactionType,
          }
        })

        // statusCode = 200
        return transaction
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map((err) => err.message)

          return { statusCode: 400, error: "Error to create transaction", details }
        } else {
          console.error("Unexpected error:", error);
          return { statusCode: 500, error: "Internal Server Error" };
        }
      }
    })
}