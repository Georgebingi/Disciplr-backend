# disciplr-backend

API and milestone engine for [Disciplr](https://github.com/your-org/Disciplr): programmable time-locked capital vaults on Stellar.

## What it does

- **Health:** `GET /api/health` — service status and timestamp.
- **Vaults:**  
  - `GET /api/vaults` — list all vaults with pagination, sorting, and filtering.  
  - `POST /api/vaults` — create a vault (body: `creator`, `amount`, `endTimestamp`, `successDestination`, `failureDestination`).  
  - `GET /api/vaults/:id` — get a vault by id.
- **Transactions:**
  - `GET /api/transactions` — list all transactions with pagination, sorting, and filtering.
  - `GET /api/transactions/:id` — get a transaction by id.
- **Analytics:**
  - `GET /api/analytics` — list analytics views with pagination, sorting, and filtering.

All list endpoints support consistent query parameters for pagination (`page`, `pageSize`), sorting (`sortBy`, `sortOrder`), and filtering (endpoint-specific fields). See [API Patterns Documentation](docs/API_PATTERNS.md) for details.

Data is stored in memory for now. Production would use PostgreSQL, a Horizon listener for on-chain events, and a proper milestone/verification engine.

## Tech stack

- **Node.js** + **TypeScript**
- **Express** for HTTP API
- **Helmet** and **CORS** for security and cross-origin

## Local setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Install and run

```bash
# From repo root
cd disciplr-backend
npm install
npm run dev
```

API runs at **http://localhost:3000**. Frontend dev server can proxy `/api` to this port.

### Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Run with tsx watch (hot reload)|
| `npm run build`| Compile TypeScript to `dist/`  |
| `npm run start`| Run compiled `dist/index.js`  |
| `npm run lint` | Run ESLint on `src`           |

### Example: create a vault

```bash
curl -X POST http://localhost:3000/api/vaults \
  -H "Content-Type: application/json" \
  -d '{
    "creator": "G...",
    "amount": "1000",
    "endTimestamp": "2025-12-31T23:59:59Z",
    "successDestination": "G...",
    "failureDestination": "G..."
  }'
```

## Project layout

```
disciplr-backend/
├── src/
│   ├── routes/
│   │   ├── health.ts
│   │   ├── vaults.ts
│   │   ├── transactions.ts
│   │   └── analytics.ts
│   ├── middleware/
│   │   └── queryParser.ts
│   ├── utils/
│   │   └── pagination.ts
│   ├── types/
│   │   └── pagination.ts
│   └── index.ts
├── docs/
│   └── API_PATTERNS.md
├── examples/
│   └── api-usage.md
├── package.json
├── tsconfig.json
└── README.md
```

## Merging into a remote

This directory is a separate git repo. To push to your own remote:

```bash
cd disciplr-backend
git remote add origin <your-disciplr-backend-repo-url>
git push -u origin main
```

Replace `<your-disciplr-backend-repo-url>` with your actual repository URL.
