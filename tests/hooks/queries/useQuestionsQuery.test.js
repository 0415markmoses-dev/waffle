import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/QuestionsService.js', () => ({
    default: {
        getQuestions: vi.fn(),
        getOne: vi.fn(),
        getQuestionStats: vi.fn(),
        createQuestion: vi.fn(),
        updateQuestion: vi.fn(),
    },
}));

import QuestionsService from '../../../src/Services/PrivateApi/QuestionsService.js';
import {
    questionKeys,
    useQuestions,
    useQuestion,
    useQuestionStats,
    usePlanHealth,
    useCreateQuestion,
    useUpdateQuestion,
} from '../../../src/Hooks/queries/useQuestionsQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('questionKeys', () => {
    it('list key includes params', () => {
        expect(questionKeys.list({plan: '1'})).toEqual(['questions', 'list', {plan: '1'}]);
    });
    it('stats key includes id', () => {
        expect(questionKeys.stats(3)).toEqual(['questions', 'stats', 3]);
    });
});

describe('useQuestions', () => {
    it('is disabled when neither plan nor testPlan nor testPlan.release params', () => {
        const {result} = renderHook(() => useQuestions({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches all questions across pages when plan param present', async () => {
        // Page 1: 2 items, total 3
        QuestionsService.getQuestions
            .mockResolvedValueOnce({data: {member: [{id: 1}, {id: 2}], totalItems: 3}})
            .mockResolvedValueOnce({data: {member: [{id: 3}], totalItems: 3}});

        const {result} = renderHook(() => useQuestions({plan: '/api/test_plans/1'}), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(3);
        expect(QuestionsService.getQuestions).toHaveBeenCalledTimes(2);
    });

    it('enabled when testPlan param present', () => {
        QuestionsService.getQuestions.mockResolvedValue({data: {member: [], totalItems: 0}});
        const {result} = renderHook(() => useQuestions({testPlan: '/api/test_plans/2'}), {
            wrapper: makeWrapper(),
        });
        expect(result.current.fetchStatus).not.toBe('idle');
    });
});

describe('useQuestion', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useQuestion(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single question', async () => {
        QuestionsService.getOne.mockResolvedValueOnce({data: {id: 5, name: 'Q5'}});
        const {result} = renderHook(() => useQuestion(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({id: 5, name: 'Q5'});
    });
});

describe('useQuestionStats', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useQuestionStats(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches stats for a question', async () => {
        const stats = {test_pass: 2, test_failed: 1, test_pending: 0, test_blocked: 0, test_pass_with_bugs: 0};
        QuestionsService.getQuestionStats.mockResolvedValueOnce({data: stats});
        const {result} = renderHook(() => useQuestionStats(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(stats);
    });
});

describe('usePlanHealth', () => {
    it('returns zeros for a plan with no questions', () => {
        const {result} = renderHook(() => usePlanHealth({questions: []}), {
            wrapper: makeWrapper(),
        });
        expect(result.current.total).toBe(0);
        expect(result.current.pass).toBe(0);
    });

    it('aggregates stats from multiple questions', async () => {
        QuestionsService.getQuestionStats
            .mockResolvedValueOnce({
                data: {
                    test_pass: 1,
                    test_failed: 1,
                    test_pending: 0,
                    test_blocked: 0,
                    test_pass_with_bugs: 0,
                    answers: []
                }
            })
            .mockResolvedValueOnce({
                data: {
                    test_pass: 2,
                    test_failed: 0,
                    test_pending: 1,
                    test_blocked: 0,
                    test_pass_with_bugs: 0,
                    answers: []
                }
            });

        const testPlan = {questions: ['/api/questions/1', '/api/questions/2']};
        const {result} = renderHook(() => usePlanHealth(testPlan), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.pass).toBe(3);
        expect(result.current.failed).toBe(1);
        expect(result.current.pending).toBe(1);
        expect(result.current.total).toBe(5);
    });
});

describe('useCreateQuestion', () => {
    it('calls createQuestion', async () => {
        QuestionsService.createQuestion.mockResolvedValueOnce({data: {id: 20}});
        const {result} = renderHook(() => useCreateQuestion(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({name: 'Q', content: 'body', plan: '/api/test_plans/1'});
        expect(data).toEqual({id: 20});
    });
});

describe('useUpdateQuestion', () => {
    it('calls updateQuestion with id and data', async () => {
        QuestionsService.updateQuestion.mockResolvedValueOnce({data: {id: 7}});
        const {result} = renderHook(() => useUpdateQuestion(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 7, data: {name: 'Updated'}});
        expect(QuestionsService.updateQuestion).toHaveBeenCalledWith(7, {name: 'Updated'});
    });
});
