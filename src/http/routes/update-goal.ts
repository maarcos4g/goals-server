import { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";

import { db } from "@/db/connection";

import { authentication } from "@/authentication";

export async function updateGoal(app: FastifyInstance) {
  app.put('/goal/:id', {
    onRequest: [authentication]
  },
    async ({ params, body }, { send, statusCode }) => {
      try {
        const updateGoalParamsSchema = z.object({
          id: z.string().cuid(),
        })

        const updateGoalSchema = z.object({
          name: z.string().min(3, { message: "O nome da meta precisa ter no mínimo 3 caracteres" }),
          value: z.number().default(0.0),
        })

        const { id } = updateGoalParamsSchema.parse(params)
        const { name, value } = updateGoalSchema.parse(body)

        const goal = await db.goal.findUnique({
          where: {
            id,
          }
        })

        if (!goal) {
          return { statusCode: 400, error: "Goal not found" }
        }

        const updatedGoal = await db.goal.update({
          data: {
            name,
            value,
          },
          where: {
            id,
          }
        })

        return updatedGoal

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