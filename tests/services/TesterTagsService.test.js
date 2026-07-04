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
import TesterTagsService from '../../src/Services/PrivateApi/TesterTagsService.js';

describe('TesterTagsService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getTags', () => {
        it('calls GET /api/tester_tags with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TesterTagsService.getTags({project: '/api/projects/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/tester_tags', {
                params: {project: '/api/projects/1'},
            });
        });

        it('calls GET /api/tester_tags with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TesterTagsService.getTags();
            expect(Http.get).toHaveBeenCalledWith('/api/tester_tags', {params: {}});
        });
    });

    describe('createTag', () => {
        it('calls POST /api/tester_tags with data', async () => {
            const payload = {name: 'Beta', project: '/api/projects/1'};
            Http.post.mockResolvedValue({data: {id: 10, ...payload}});
            await TesterTagsService.createTag(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/tester_tags', payload);
        });
    });
});
