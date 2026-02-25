import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { vaultsRouter } from './routes/vaults.js'
import { healthRouter } from './routes/health.js'
import { transactionsRouter } from './routes/transactions.js'
import { analyticsRouter } from './routes/analytics.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/vaults', vaultsRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/analytics', analyticsRouter)

app.listen(PORT, () => {
  console.log(`Disciplr API listening on http://localhost:${PORT}`)
})
