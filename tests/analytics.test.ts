import { db, initializeDatabase, getTimeRangeFilter, updateAnalyticsSummary } from '../src/db/database.js'
import { getOverallAnalytics, getAnalyticsByPeriod, getVaultStatusBreakdown, getCapitalAnalytics } from '../src/services/analytics.service.js'

describe('Analytics Service', () => {
    beforeAll(() => { initializeDatabase() })
    beforeEach(() => {
        db.prepare('DELETE FROM vaults').run()
        db.prepare('DELETE FROM vault_analytics_summary').run()
        db.prepare(`INSERT INTO vault_analytics_summary (id, total_vaults, active_vaults, completed_vaults, failed_vaults, total_locked_capital, active_capital, success_rate, last_updated) VALUES (1, 0, 0, 0, 0, '0', '0', 0, datetime('now'))`).run()
    })
    afterAll(() => { db.close() })

    describe('getTimeRangeFilter', () => {
        it('should return correct date range for 7d', () => {
            const { startDate, endDate } = getTimeRangeFilter('7d')
            const diffDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
            expect(diffDays).toBeCloseTo(7, 0)
        })
        it('should return epoch start for unknown period', () => {
            const { startDate } = getTimeRangeFilter('unknown')
            expect(startDate).toBe(new Date(0).toISOString())
        })
    })

    describe('getOverallAnalytics', () => {
        it('should return zero analytics when no vaults exist', () => {
            const analytics = getOverallAnalytics()
            expect(analytics.totalVaults).toBe(0)
            expect(analytics.successRate).toBe(0)
        })
        it('should return correct analytics with vaults', () => {
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-1', 'user1', '1000', '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', '0xA', '0xB', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-2', 'user2', '2000', '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', '0xA', '0xB', 'completed', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-3', 'user3', '3000', '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', '0xA', '0xB', 'failed', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
            updateAnalyticsSummary()
            const analytics = getOverallAnalytics()
            expect(analytics.totalVaults).toBe(3)
            expect(analytics.successRate).toBe(50)
        })
    })

    describe('getAnalyticsByPeriod', () => {
        it('should filter vaults by time period', () => {
            const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-old', 'user1', '1000', fifteenDaysAgo, '2026-12-31T00:00:00Z', '0xA', '0xB', 'completed', fifteenDaysAgo, fifteenDaysAgo)
            const today = new Date().toISOString()
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-new', 'user2', '2000', today, '2026-12-31T00:00:00Z', '0xA', '0xB', 'active', today, today)
            const analytics30d = getAnalyticsByPeriod('30d')
            expect(analytics30d.totalVaults).toBe(2)
            const analytics7d = getAnalyticsByPeriod('7d')
            expect(analytics7d.totalVaults).toBe(1)
        })
    })

    describe('getCapitalAnalytics', () => {
        it('should return correct capital analytics', () => {
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-1', 'user1', '1000', '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', '0xA', '0xB', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
            db.prepare(`INSERT INTO vaults (id, creator, amount, start_timestamp, end_timestamp, success_destination, failure_destination, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('vault-2', 'user2', '2000', '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', '0xA', '0xB', 'completed', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
            const capital = getCapitalAnalytics('all')
            expect(capital.totalLockedCapital).toBe('3000')
            expect(capital.activeCapital).toBe('1000')
        })
    })
})
