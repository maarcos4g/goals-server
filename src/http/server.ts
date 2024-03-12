import fastify from "fastify"
import fastifyCors from "@fastify/cors"
import fastifyJwt from "@fastify/jwt"

import { env } from "@/env"

import { createUser } from "@/http/routes/create-user"
import { createGoal } from "@/http/routes/create-goal"
import { createTransaction } from "@/http/routes/create-transaction"
import { getGoal } from "@/http/routes/get-goal-details"
import { deleteGoal } from "@/http/routes/delete-goal"
import { autoDelete } from "@/utils/auto-delete"
import { getLastTransactions } from "@/http/routes/last-transactions"
import { getProfile } from "./routes/get-profile"

const app = fastify()

app.register(fastifyCors, {
  origin: '*' // url da app frontend
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

//routes
app.register(createUser)
app.register(createGoal)
app.register(createTransaction)
app.register(getGoal)
app.register(deleteGoal)
app.register(getLastTransactions)
app.register(getProfile)

//async events
autoDelete().catch((err) => console.log('Error to run events'))

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('🔥 HTTP Server Running...'))
  .catch((error) => console.log(`Error to access this app: ${error}`))