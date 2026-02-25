import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { vaultsRouter } from './routes/vaults.js'
import { healthRouter } from './routes/health.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { config } from './config/index.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: config.corsOrigins === '*' ? true : config.corsOrigins,
  }),
)
app.use(express.json())
app.use(requestLogger)

app.use('/health', healthRouter)
app.use('/api/health', healthRouter)
app.use('/api/vaults', vaultsRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Disciplr API listening on http://localhost:${config.port}`)
})
