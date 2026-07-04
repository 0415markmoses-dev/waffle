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
import AnswersService from '../../src/Services/PrivateApi/AnswersService.js';

describe('AnswersService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getAnswers', () => {
        it('calls GET /api/answers with params', async () => {
            Http.get.mockResolvedValue({data: {member: [], totalItems: 0}});
            await AnswersService.getAnswers({'question.plan': '/api/test_plans/5', tester: '/api/testers/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/answers', {
                params: {'question.plan': '/api/test_plans/5', tester: '/api/testers/1'},
            });
        });

        it('calls GET /api/answers with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await AnswersService.getAnswers();
            expect(Http.get).toHaveBeenCalledWith('/api/answers', {params: {}});
        });

        it('returns the response', async () => {
            Http.get.mockResolvedValue({data: {totalItems: 3}});
            const result = await AnswersService.getAnswers();
            expect(result.data.totalItems).toBe(3);
        });
    });

    describe('getAnswer', () => {
        it('calls GET /api/answers/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 99}});
            await AnswersService.getAnswer(99);
            expect(Http.get).toHaveBeenCalledWith('/api/answers/99');
        });
    });

    describe('createAnswer', () => {
        it('calls POST /api/answers with data', async () => {
            const payload = {state: 'pass', question: '/api/questions/1', tester: '/api/testers/2'};
            Http.post.mockResolvedValue({data: {id: 1, ...payload}});
            await AnswersService.createAnswer(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/answers', payload);
        });
    });

    describe('patchAnswer', () => {
        it('calls PATCH /api/answers/:id with merge-patch Content-Type', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await AnswersService.patchAnswer(55, {state: 'failed', comment: 'Does not work'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/answers/55',
                {state: 'failed', comment: 'Does not work'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });
});
