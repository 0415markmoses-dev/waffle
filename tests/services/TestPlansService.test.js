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
import TestPlansService from '../../src/Services/PrivateApi/TestPlansService.js';

describe('TestPlansService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getTestPlans', () => {
        it('calls GET /api/test_plans with params', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TestPlansService.getTestPlans({release: '/api/releases/1'});
            expect(Http.get).toHaveBeenCalledWith('/api/test_plans', {
                params: {release: '/api/releases/1'},
            });
        });

        it('calls GET /api/test_plans with empty params by default', async () => {
            Http.get.mockResolvedValue({data: {member: []}});
            await TestPlansService.getTestPlans();
            expect(Http.get).toHaveBeenCalledWith('/api/test_plans', {params: {}});
        });
    });

    describe('getOne', () => {
        it('calls GET /api/test_plans/:id', async () => {
            Http.get.mockResolvedValue({data: {id: 17, name: 'Login flow'}});
            await TestPlansService.getOne(17);
            expect(Http.get).toHaveBeenCalledWith('/api/test_plans/17');
        });
    });

    describe('createTestPlan', () => {
        it('calls POST /api/test_plans with data', async () => {
            const payload = {
                name: 'New plan',
                description: 'Desc',
                release: '/api/releases/1',
                state: 'draft',
                dueDate: '2025-12-31T23:59:00.000Z',
            };
            Http.post.mockResolvedValue({data: {id: 99, ...payload}});
            await TestPlansService.createTestPlan(payload);
            expect(Http.post).toHaveBeenCalledWith('/api/test_plans', payload);
        });
    });

    describe('updateTestPlan', () => {
        it('calls PATCH /api/test_plans/:id with merge-patch header', async () => {
            Http.patch.mockResolvedValue({data: {}});
            await TestPlansService.updateTestPlan(17, {questionsOrder: ['/api/questions/1', '/api/questions/2']});
            expect(Http.patch).toHaveBeenCalledWith(
                '/api/test_plans/17',
                {questionsOrder: ['/api/questions/1', '/api/questions/2']},
                {headers: {'Content-Type': 'application/merge-patch+json'}},
            );
        });
    });

    describe('addDemoAnswers', () => {
        it('calls POST /api/demo/add_demo_answer with IRI and count', async () => {
            Http.post.mockResolvedValue({data: {}});
            await TestPlansService.addDemoAnswers('/api/test_plans/17', 5);
            expect(Http.post).toHaveBeenCalledWith('/api/demo/add_demo_answer', {
                testingPlanIri: '/api/test_plans/17',
                number: 5,
            });
        });

        it('defaults number to 10', async () => {
            Http.post.mockResolvedValue({data: {}});
            await TestPlansService.addDemoAnswers('/api/test_plans/17');
            expect(Http.post).toHaveBeenCalledWith('/api/demo/add_demo_answer', {
                testingPlanIri: '/api/test_plans/17',
                number: 10,
            });
        });
    });

    describe('getProgression', () => {
        it('calls GET /api/test_plans/:id/testing_progression', async () => {
            Http.get.mockResolvedValue({data: {progression: 0.75}});
            await TestPlansService.getProgression(17);
            expect(Http.get).toHaveBeenCalledWith('/api/test_plans/17/testing_progression');
        });
    });
});
