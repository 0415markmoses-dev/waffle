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
import UploadService from '../../src/Services/Upload/UploadService.js';

describe('UploadService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getUploadRequest', () => {
        it('calls POST /api/uploads/request with filename and size', async () => {
            Http.post.mockResolvedValue({data: {uploadUrl: '/upload/token', jwt: 'upload-jwt'}});
            await UploadService.getUploadRequest('photo.png', 204800);
            expect(Http.post).toHaveBeenCalledWith('/api/uploads/request', {
                filename: 'photo.png',
                size: 204800,
            });
        });

        it('returns the upload URL response', async () => {
            Http.post.mockResolvedValue({data: {uploadUrl: '/upload/abc', jwt: 'tok'}});
            const result = await UploadService.getUploadRequest('doc.pdf', 512000);
            expect(result.data.uploadUrl).toBe('/upload/abc');
            expect(result.data.jwt).toBe('tok');
        });
    });

    describe('uploadFile', () => {
        it('calls POST /public/apx/upload with FormData and Bearer jwt', async () => {
            const file = new File(['content'], 'test.png', {type: 'image/png'});
            Http.post.mockResolvedValue({data: {url: '/uploads/test.png'}});
            await UploadService.uploadFile(file, 'my-jwt-token');
            expect(Http.post).toHaveBeenCalledWith(
                '/public/apx/upload',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer my-jwt-token',
                    },
                },
            );
        });

        it('appends the file to FormData under key "file"', async () => {
            const file = new File(['data'], 'image.jpg', {type: 'image/jpeg'});
            let capturedFormData;
            Http.post.mockImplementation((_url, formData) => {
                capturedFormData = formData;
                return Promise.resolve({data: {}});
            });
            await UploadService.uploadFile(file, 'tok');
            expect(capturedFormData.get('file')).toBe(file);
        });
    });
});
