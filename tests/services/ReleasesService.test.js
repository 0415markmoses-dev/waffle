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
import ReleasesService from '../../src/Services/PrivateApi/ReleasesService.js';

describe('ReleasesService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getReleases', () => {
        it('calls GET /api/releases with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await ReleasesService.getReleases({project: '/api/projects/1', page: 1});
            expect(Http.get).toHaveBeenCalledWith('/api/releases', {
                params: {project: '/api/projects/1', page: 1},
            });
        });

        it('calls GET /api/releases with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await ReleasesService.getReleases();
            expect(Http.get).toHaveBeenCalledWith('/api/releases', {params: {}});
        });
    });

    describe('createRelease', () => {
        it('calls POST /api/releases with data', async () => {
            const payload = {name: 'v1.0', project: '/api/projects/1'};
            Http.post.mockResolvedValue({data: {id: 5, ...payload}});
            await ReleasesService.createRelease(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/releases', payload);
        });
    });

    describe('getRelease', () => {
        it('calls GET /api/releases/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 5, name: 'v1.0'}});
            await ReleasesService.getRelease(5);
            expect(Http.get).toHaveBeenCalledWith('/api/releases/5');
        });
    });

    describe('updateRelease', () => {
        it('calls PATCH /api/releases/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await ReleasesService.updateRelease(5, {name: 'v1.1'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/releases/5',
                {name: 'v1.1'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('getReleaseStats', () => {
        it('calls GET /api/release_stats/:id', async () => {
            Http.get.mockResolvedValue({data: {totalPlans: 3}});
            await ReleasesService.getReleaseStats(5);
            expect(Http.get).toHaveBeenCalledWith('/api/release_stats/5');
        });
    });
});
