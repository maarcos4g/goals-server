import fastifyCors from "@fastify/cors"
import fastify from "fastify"

const app = fastify()

app.register(fastifyCors, {
  origin: '*' // url da app frontend
})

app.listen({
  port: 3333,
  host: '0.0.0.0'
})
  .then(() => console.log('🔥 HTTP Server Running...'))
  .catch((error) => console.log(`Error to access this app: ${error}`))