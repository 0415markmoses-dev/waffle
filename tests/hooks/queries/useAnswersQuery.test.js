import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/AnswersService.js', () => ({
    default: {
        getAnswers: vi.fn(),
        getAnswer: vi.fn(),
        createAnswer: vi.fn(),
        patchAnswer: vi.fn(),
    },
}));

import AnswersService from '../../../src/Services/PrivateApi/AnswersService.js';
import {
    answerKeys,
    useAnswers,
    useAnswer,
    useCreateAnswer,
    useRecentProjectAnswers,
    useAnswersByTester,
    useUpdateAnswer,
} from '../../../src/Hooks/queries/useAnswersQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('answerKeys', () => {
    it('list key includes params', () => {
        expect(answerKeys.list({question: '1'})).toEqual(['answers', 'list', {question: '1'}]);
    });
    it('detail key includes id', () => {
        expect(answerKeys.detail(5)).toEqual(['answers', 'detail', 5]);
    });
});

describe('useAnswers', () => {
    it('is disabled when params.question is missing', () => {
        const {result} = renderHook(() => useAnswers({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches when question param present', async () => {
        AnswersService.getAnswers.mockResolvedValueOnce({data: {member: [{id: 1}]}});
        const {result} = renderHook(() => useAnswers({question: '/api/questions/1'}), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(AnswersService.getAnswers).toHaveBeenCalledWith(
            expect.objectContaining({question: '/api/questions/1'})
        );
    });
});

describe('useAnswer', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useAnswer(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches by id', async () => {
        AnswersService.getAnswer.mockResolvedValueOnce({data: {id: 7}});
        const {result} = renderHook(() => useAnswer(7), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({id: 7});
    });
});

describe('useCreateAnswer', () => {
    it('calls createAnswer', async () => {
        AnswersService.createAnswer.mockResolvedValueOnce({data: {id: 99, question: '/api/questions/1'}});
        const {result} = renderHook(() => useCreateAnswer(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({question: '/api/questions/1', text: 'yes'});
        expect(data).toEqual({id: 99, question: '/api/questions/1'});
    });
});

describe('useRecentProjectAnswers', () => {
    it('is disabled when projectId is falsy', () => {
        const {result} = renderHook(() => useRecentProjectAnswers(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches recent answers for project', async () => {
        AnswersService.getAnswers.mockResolvedValueOnce({data: {member: [{id: 1}]}});
        const {result} = renderHook(() => useRecentProjectAnswers(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(AnswersService.getAnswers).toHaveBeenCalledWith(
            expect.objectContaining({'question.testPlan.release.project': 5, itemsPerPage: 10})
        );
    });
});

describe('useAnswersByTester', () => {
    it('is disabled when testerIri or projectId is falsy', () => {
        const {result} = renderHook(() => useAnswersByTester(null, 5), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches answers by tester', async () => {
        AnswersService.getAnswers.mockResolvedValueOnce({data: {member: []}});
        const {result} = renderHook(() => useAnswersByTester('/api/testers/1', 5), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(AnswersService.getAnswers).toHaveBeenCalledWith(
            expect.objectContaining({tester: '/api/testers/1', 'question.testPlan.release.project': 5})
        );
    });
});

describe('useUpdateAnswer', () => {
    it('calls patchAnswer', async () => {
        AnswersService.patchAnswer.mockResolvedValueOnce({data: {id: 3}});
        const {result} = renderHook(() => useUpdateAnswer(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({id: 3, data: {status: 'pass'}});
        expect(AnswersService.patchAnswer).toHaveBeenCalledWith(3, {status: 'pass'});
        expect(data).toEqual({id: 3});
    });
});
