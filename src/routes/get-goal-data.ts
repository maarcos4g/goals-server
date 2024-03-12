import { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";
import { authentication } from "@/authentication";
import { db } from "@/db/connection";
import dayjs from "dayjs";

export async function getGoal(app: FastifyInstance) {
  app.get('/goal/:id', {
    onRequest: [authentication]
  },
    async ({ params }, { send, statusCode }) => {
      try {
        const getGoalSchema = z.object({
          id: z.string().cuid({ message: "Você precisa fornecer o id da meta que está tentanto buscar os dados" }),
        })

        const { id } = getGoalSchema.parse(params)

        const goal = await db.goal.findUnique({
          where: {
            id,
            AND: {
              deletedAt: null
            }
          }
        })

        if (!goal) {
          return;
        }

        const transactions = await db.transaction.findMany({
          where: {
            goalId: id,
            AND: {
              deletedAt: null
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
        })

        // statusCode = 200
        return {
          goal: {
            id: goal.id,
            name: goal.name,
            value: goal.value,
          },
          transactions: transactions.map(transaction => {
            const date = dayjs(transaction.createdAt).locale('pt-BR').format('DD/MM/YYYY')
            return {
              id: transaction.id,
              type: transaction.type,
              value: transaction.value.toFixed(2).replace('.', ','),
              createdAt: transaction.createdAt,
              formatDate: date,
            }
          })
        }
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map((err) => err.message)

          return { statusCode: 400, error: "Error to get goal", details }
        } else {
          console.error("Unexpected error:", error);
          return { statusCode: 500, error: "Internal Server Error", details: error };
        }
      }
    })
}