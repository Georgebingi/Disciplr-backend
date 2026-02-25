import { Router } from 'express'

export const vaultsRouter = Router()

// In-memory placeholder; replace with DB (e.g. PostgreSQL) later
const vaults: Array<{
  id: string
  creator: string
  amount: string
  startTimestamp: string
  endTimestamp: string
  successDestination: string
  failureDestination: string
  status: 'active' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
}> = []

type VaultHistory = {
  id: string
  vaultId: string
  oldStatus: string | null
  newStatus: string
  reason: string
  actorUserIdOrAddress: string
  createdAt: string
  metadata: Record<string, unknown>
}

const vaultHistory: Array<VaultHistory> = []

function appendVaultHistory(
  vaultId: string,
  oldStatus: string | null,
  newStatus: string,
  reason: string,
  actorUserIdOrAddress: string,
  metadata: Record<string, unknown> = {}
) {
  vaultHistory.push({
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    vaultId,
    oldStatus,
    newStatus,
    reason,
    actorUserIdOrAddress,
    createdAt: new Date().toISOString(),
    metadata,
  })
}

vaultsRouter.get('/', (_req, res) => {
  res.json({ vaults })
})

vaultsRouter.post('/', (req, res) => {
  const {
    creator,
    amount,
    endTimestamp,
    successDestination,
    failureDestination,
  } = req.body as Record<string, string>

  if (!creator || !amount || !endTimestamp || !successDestination || !failureDestination) {
    res.status(400).json({
      error: 'Missing required fields: creator, amount, endTimestamp, successDestination, failureDestination',
    })
    return
  }

  const id = `vault-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const startTimestamp = new Date().toISOString()
  const vault = {
    id,
    creator,
    amount,
    startTimestamp,
    endTimestamp,
    successDestination,
    failureDestination,
    status: 'active' as const,
    createdAt: startTimestamp,
  }
  vaults.push(vault)

  appendVaultHistory(
    id,
    null,
    'active',
    'Vault created',
    creator,
    { initialAmount: amount }
  )

  res.status(201).json(vault)
})

vaultsRouter.get('/:id/history', (req, res) => {
  const history = vaultHistory
    .filter((entry) => entry.vaultId === req.params.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  res.json({ history })
})

vaultsRouter.get('/:id', (req, res) => {
  const vault = vaults.find((v) => v.id === req.params.id)
  if (!vault) {
    res.status(404).json({ error: 'Vault not found' })
    return
  }
  res.json(vault)
})
