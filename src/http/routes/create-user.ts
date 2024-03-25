import { db } from "@/db/connection";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function createUser(app: FastifyInstance) {

  const { jwt } = app

  app.post('/user', async ({ body }, { status }) => {
    const createUserBodySchema = z.object({
      email: z.string().email({ message: "Digite um e-mail válido" }),
      name: z.string().min(3, { message: "O nome precisa conter no mínimo 3 caracteres" }),
      avatarUrl: z.string().url().optional(),
      authId: z.string().optional(),
    })

    const { email, name, authId, avatarUrl } = createUserBodySchema.parse(body)

    let user = await db.user.findUnique({
      where: {
        email,
      }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          avatarUrl: avatarUrl,
          email,
          name,
          authId,
        }
      })
    }

    const token = jwt.sign({}, {
      sub: user.id,
      expiresIn: '30 days'
    })

    return { token }
  })
}