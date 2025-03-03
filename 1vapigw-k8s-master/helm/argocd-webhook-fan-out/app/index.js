import 'dotenv/config'
import Fastify from 'fastify'
import got from 'got'

const fastify = Fastify({ logger: true })

fastify.get('/ping', async () => {
  return { health: 'ok' }
})

fastify.post('/', async (request) => {
  const endpoints = process.env.ENDPOINTS.split(',')
  const options = {
    json: request.body,
    headers: {
      'X-GitHub-Event': 'push'
    },
    timeout: { request: 15000 }
  }

  const fanOutRequests = []
  endpoints.forEach(endpoint => fanOutRequests.push(got.post(endpoint, options)
    .then(response => fastify.log.info(`${endpoint} - ${response.statusCode}`))
    .catch(error => fastify.log.error(`${endpoint} - ${error.toLocaleString()}`))))
  await Promise.all(fanOutRequests)
  return { status: 'ok' }
})

const start = async () => {
  try {
    const ip = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1'
    await fastify.listen(3000, ip)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start().catch(err => {
  fastify.log.error(err)
})
