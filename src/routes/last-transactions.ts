import { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import { ZodError, z } from "zod";

import { db } from "@/db/connection";

import { authentication } from "@/authentication";
import { userPayload } from "@/utils/auth";

export async function getLastTransactions(app: FastifyInstance) {
  app.get('/transactions', {
    onRequest: [authentication]
  },
    async ({ user }, { send, statusCode }) => {
      try {
        const { sub: userId } = user as userPayload

        const goals = await db.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            goals: {
              select: {
                transactions: true
              }
            }
          }
        })

        if (!goals) {
          return;
        }

        return goals.goals

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