import { FastifyInstance } from "fastify";
import { userPayload } from "@/utils/auth";
import { ZodError, z } from "zod";
import { authentication } from "@/authentication";
import { db } from "@/db/connection";

export async function createGoal(app: FastifyInstance) {
  app.post('/goal', {
    onRequest: [authentication]
  },
    async ({ body, user }, { send, statusCode }) => {
      try {
        const { sub: userId } = user as userPayload

        const createGoalSchema = z.object({
          name: z.string().min(3, { message: "O nome da meta precisa ter no mínimo 3 caracteres" }),
          value: z.number().default(0.0),
        })

        const { name, value } = createGoalSchema.parse(body)


        const goal = await db.goal.create({
          data: {
            name,
            value,
            userId
          }
        })

        // statusCode = 200
        return goal
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map((err) => err.message)

          return { statusCode: 400, error: "Error to create goal", details }
        } else {
          console.error("Unexpected error:", error);
          return { statusCode: 500, error: "Internal Server Error" };
        }
      }
    })
}