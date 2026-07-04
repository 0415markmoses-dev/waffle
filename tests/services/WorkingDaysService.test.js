import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('../../src/Services/Http.js', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

import Http from '../../src/Services/Http.js';
import WorkingDaysService from '../../src/Services/PrivateApi/WorkingDaysService.js';

/**
 * Working days mock indexed by JS getDay() values:
 *   0 = Sunday (off), 1 = Monday … 5 = Friday (on), 6 = Saturday (off)
 */
const makeWorkingDaysMock = () => [
    {id: 'sunday', details: []},                              // index 0 → Sunday
    {id: 'monday', details: [{from: '08:00', to: '17:00'}]}, // index 1 → Monday
    {id: 'tuesday', details: [{from: '08:00', to: '17:00'}]}, // index 2 → Tuesday
    {id: 'wednesday', details: [{from: '08:00', to: '17:00'}]}, // index 3 → Wednesday
    {id: 'thursday', details: [{from: '08:00', to: '17:00'}]}, // index 4 → Thursday
    {id: 'friday', details: [{from: '08:00', to: '17:00'}]}, // index 5 → Friday
    {id: 'saturday', details: []},                              // index 6 → Saturday
];

describe('WorkingDaysService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        WorkingDaysService._workingDays = null; // reset cache
    });

    // ── getWorkingDays ────────────────────────────────────────────────────────

    describe('getWorkingDays', () => {
        it('calls GET /api/working_hours and returns the member array', async () => {
            const member = makeWorkingDaysMock();
            Http.get.mockResolvedValue({data: {member}});
            const result = await WorkingDaysService.getWorkingDays();
            expect(Http.get).toHaveBeenCalledWith('/api/working_hours', {params: {}});
            expect(result).toEqual(member);
        });

        it('forwards extra query params', async () => {
            Http.get.mockResolvedValue({data: {member: makeWorkingDaysMock()}});
            await WorkingDaysService.getWorkingDays({project: '1'});
            expect(Http.get).toHaveBeenCalledWith('/api/working_hours', {params: {project: '1'}});
        });

        it('caches the result — second call does not hit the API', async () => {
            Http.get.mockResolvedValue({data: {member: makeWorkingDaysMock()}});
            await WorkingDaysService.getWorkingDays();
            await WorkingDaysService.getWorkingDays();
            expect(Http.get).toHaveBeenCalledTimes(1);
        });

        it('returns the cached value on subsequent calls', async () => {
            const member = makeWorkingDaysMock();
            Http.get.mockResolvedValue({data: {member}});
            const first = await WorkingDaysService.getWorkingDays();
            const second = await WorkingDaysService.getWorkingDays();
            expect(second).toBe(first);
        });
    });

    // ── getWorkingDayBetween ──────────────────────────────────────────────────

    describe('getWorkingDayBetween', () => {
        beforeEach(() => {
            Http.get.mockResolvedValue({data: {member: makeWorkingDaysMock()}});
        });

        it('counts Mon–Fri (5 working days)', async () => {
            // 2025-01-06 = Monday, 2025-01-10 = Friday
            const start = new Date('2025-01-06T00:00:00');
            const end = new Date('2025-01-10T00:00:00');
            const count = await WorkingDaysService.getWorkingDayBetween(start, end);
            expect(count).toBe(5);
        });

        it('returns 0 for a Sat–Sun range (both off)', async () => {
            // 2025-01-11 = Saturday, 2025-01-12 = Sunday
            const start = new Date('2025-01-11T00:00:00');
            const end = new Date('2025-01-12T00:00:00');
            const count = await WorkingDaysService.getWorkingDayBetween(start, end);
            expect(count).toBe(0);
        });

        it('counts a full week (Mon–Sun) as 5 working days', async () => {
            // 2025-01-06 Mon → 2025-01-12 Sun
            const start = new Date('2025-01-06T00:00:00');
            const end = new Date('2025-01-12T00:00:00');
            const count = await WorkingDaysService.getWorkingDayBetween(start, end);
            expect(count).toBe(5);
        });

        it('counts a single working day (Monday) as 1', async () => {
            const day = new Date('2025-01-06T00:00:00'); // Monday
            const count = await WorkingDaysService.getWorkingDayBetween(day, day);
            expect(count).toBe(1);
        });

        it('counts a single weekend day (Saturday) as 0', async () => {
            const day = new Date('2025-01-11T00:00:00'); // Saturday
            const count = await WorkingDaysService.getWorkingDayBetween(day, day);
            expect(count).toBe(0);
        });

        it('uses the cached working-days list (only one API call)', async () => {
            const start = new Date('2025-01-06T00:00:00');
            const end = new Date('2025-01-10T00:00:00');
            await WorkingDaysService.getWorkingDayBetween(start, end);
            await WorkingDaysService.getWorkingDayBetween(start, end);
            expect(Http.get).toHaveBeenCalledTimes(1);
        });
    });
});
