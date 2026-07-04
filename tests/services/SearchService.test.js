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
import SearchService from '../../src/Services/PrivateApi/SearchService.js';

describe('SearchService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('search', () => {
        it('calls GET /api/search/query with query param only when no scope', async () => {
            Http.get.mockResolvedValue({data: {results: []}});
            await SearchService.search('login');
            expect(Http.get).toHaveBeenCalledWith('/api/search/query', {
                params: {query: 'login'},
            });
        });

        it('includes comma-joined scope when provided', async () => {
            Http.get.mockResolvedValue({data: {results: []}});
            await SearchService.search('login', ['testers', 'releases']);
            expect(Http.get).toHaveBeenCalledWith('/api/search/query', {
                params: {query: 'login', scope: 'testers,releases'},
            });
        });

        it('does not include scope param when scope is empty array', async () => {
            Http.get.mockResolvedValue({data: {results: []}});
            await SearchService.search('test', []);
            const call = Http.get.mock.calls[0];
            expect(call[1].params).not.toHaveProperty('scope');
        });

        it('returns the response', async () => {
            Http.get.mockResolvedValue({data: {results: [{type: 'tester', id: 1}]}});
            const result = await SearchService.search('john');
            expect(result.data.results).toHaveLength(1);
        });
    });
});
