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
import AnnotationsService from '../../src/Services/PrivateApi/AnnotationsService.js';

describe('AnnotationsService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getAnnotations', () => {
        it('calls GET /api/tester_annotations with provided params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await AnnotationsService.getAnnotations({tester: '/api/testers/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/tester_annotations', {
                params: {tester: '/api/testers/1'},
            });
        });

        it('calls GET /api/tester_annotations with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await AnnotationsService.getAnnotations();
            expect(Http.get).toHaveBeenCalledWith('/api/tester_annotations', {params: {}});
        });
    });

    describe('createAnnotation', () => {
        it('calls POST /api/tester_annotations with data', async () => {
            const payload = {text: 'Nice work', tester: '/api/testers/1'};
            Http.post.mockResolvedValue({data: {id: 10, ...payload}});
            await AnnotationsService.createAnnotation(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/tester_annotations', payload);
        });
    });

    describe('updateAnnotation', () => {
        it('calls PATCH /api/tester_annotations/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await AnnotationsService.updateAnnotation(7, {text: 'Updated'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/tester_annotations/7',
                {text: 'Updated'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('deleteAnnotation', () => {
        it('calls DELETE /api/tester_annotations/:id', async () => {
            Http.delete.mockResolvedValue({data: {}});
            await AnnotationsService.deleteAnnotation(7);
            expect(Http.delete).toHaveBeenCalledWith('/api/tester_annotations/7');
        });
    });
});
