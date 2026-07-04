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
import QuestionsService from '../../src/Services/PrivateApi/QuestionsService.js';

describe('QuestionsService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getQuestions', () => {
        it('calls GET /api/questions with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await QuestionsService.getQuestions({plan: '/api/test_plans/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/questions', {
                params: {plan: '/api/test_plans/1'},
            });
        });

        it('calls GET /api/questions with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await QuestionsService.getQuestions();
            expect(Http.get).toHaveBeenCalledWith('/api/questions', {params: {}});
        });
    });

    describe('getOne', () => {
        it('calls GET /api/questions/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 12, name: 'Login test'}});
            await QuestionsService.getOne(12);
            expect(Http.get).toHaveBeenCalledWith('/api/questions/12');
        });
    });

    describe('updateQuestion', () => {
        it('calls PATCH /api/questions/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await QuestionsService.updateQuestion(12, {name: 'Updated name'});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/questions/12',
                {name: 'Updated name'},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('createQuestion', () => {
        it('calls POST /api/questions with data', async () => {
            const payload = {name: 'Can user login?', content: '...', plan: '/api/test_plans/1'};
            Http.post.mockResolvedValue({data: {id: 99, ...payload}});
            await QuestionsService.createQuestion(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/questions', payload);
        });
    });

    describe('getQuestionStats', () => {
        it('calls GET /api/questions/:id/stats', async () => {
            Http.get.mockResolvedValue({data: {pass: 3, failed: 1}});
            await QuestionsService.getQuestionStats(12);
            expect(Http.get).toHaveBeenCalledWith('/api/questions/12/stats');
        });
    });
});
