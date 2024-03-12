import { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";
import { authentication } from "@/authentication";
import { db } from "@/db/connection";
import dayjs from "dayjs";

export async function deleteGoal(app: FastifyInstance) {
  app.delete('/goal/:id', {
    onRequest: [authentication]
  },
    async ({ params }, { send, statusCode, status }) => {
      try {
        const deleteGoalSchema = z.object({
          id: z.string().cuid({ message: "Você precisa fornecer o id da meta que está tentanto excluir" }),
        })

        const { id } = deleteGoalSchema.parse(params)

        const goal = await db.goal.findUnique({
          where: {
            id,
          }
        })

        if (!goal) {
          return;
        }

        await db.transaction.updateMany({
          where: {
            goalId: goal.id,
          },
          data: {
            deletedAt: new Date(),
          }
        })

        await db.goal.update({
          data: {
            deletedAt: new Date(),
          },
          where: {
            id,
          }
        })

        // statusCode = 200
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map((err) => err.message)

          return { statusCode: 400, error: "Error to delete goal", details }
        } else {
          console.error("Unexpected error:", error);
          return { statusCode: 500, error: "Internal Server Error", details: error };
        }
      }
    })
}