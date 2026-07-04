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
import FilesService from '../../src/Services/PrivateApi/FilesService.js';

describe('FilesService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getFile', () => {
        it('calls GET with the full IRI', async () => {
            Http.get.mockResolvedValue({data: {id: 1, url: '/uploads/file.pdf'}});
            await FilesService.getFile('/api/files/1');
            expect(Http.get).toHaveBeenCalledWith('/api/files/1');
        });

        it('returns the response', async () => {
            Http.get.mockResolvedValue({data: {url: '/uploads/img.png'}});
            const result = await FilesService.getFile('/api/files/42');
            expect(result.data.url).toBe('/uploads/img.png');
        });
    });

    describe('deleteFile', () => {
        it('calls DELETE with the full IRI', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await FilesService.deleteFile('/api/files/1');
            expect(Http.delete).toHaveBeenCalledWith('/api/files/1');
        });

        it('passes arbitrary IRIs through unchanged', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await FilesService.deleteFile('/api/answer_files/999');
            expect(Http.delete).toHaveBeenCalledWith('/api/answer_files/999');
        });
    });
});
