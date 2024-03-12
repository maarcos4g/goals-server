import { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";

import { db } from "@/db/connection";

import { authentication } from "@/authentication";
import { userPayload } from "@/utils/auth";

export async function getProfile(app: FastifyInstance) {
  app.get('/me', {
    onRequest: [authentication]
  },
    async ({ user: signUser }, { send, statusCode }) => {
      try {
        const { sub: userId } = signUser as userPayload

        const user = await db.user.findUnique({
          where: {
            id: userId,
          }
        })

        if (!user) {
          return;
        }

        return {
          id: user.id,
          email: user.email,
          avatarUrl: user.avatarUrl,
          name: user.name,
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