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
import PublicProfilesService from '../../src/Services/PrivateApi/PublicProfilesService.js';

describe('PublicProfilesService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getProfile', () => {
        it('calls GET /api/public-profiles/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 'abc-123', name: 'John'}});
            await PublicProfilesService.getProfile('abc-123');
            expect(Http.get).toHaveBeenCalledWith('/api/public-profiles/abc-123');
        });

        it('returns the response data', async () => {
            Http.get.mockResolvedValue({data: {id: 'xyz', nickname: 'tester1'}});
            const result = await PublicProfilesService.getProfile('xyz');
            expect(result.data.nickname).toBe('tester1');
        });
    });
});
