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

    describe('uploadFile', () => {
        it('calls POST /public/apx/upload with FormData and multipart Content-Type', async () => {
            // Authorization is not set here — it's added automatically by the
            // Http request interceptor (see Http.test.js), not by UploadService.
            const file = new File(['content'], 'test.png', {type: 'image/png'});
            Http.post.mockResolvedValue({data: {url: '/uploads/test.png'}});
            await UploadService.uploadFile(file);
            expect(Http.post).toHaveBeenCalledWith(
                '/public/apx/upload',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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
            await UploadService.uploadFile(file);
            expect(capturedFormData.get('file')).toBe(file);
        });
    });
});
