import fastifyCors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"
import fastify from "fastify"

import { env } from "@/env"
import { createUser } from "@/routes/create-user"

const app = fastify()

app.register(fastifyCors, {
  origin: '*' // url da app frontend
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

//routes
app.register(createUser)

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('🔥 HTTP Server Running...'))
  .catch((error) => console.log(`Error to access this app: ${error}`))