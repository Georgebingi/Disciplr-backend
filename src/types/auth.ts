import { UserRole } from '@prisma/client'

export interface JWTPayload {
    userId: string
    role: UserRole
}

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload
        }
    }
}
