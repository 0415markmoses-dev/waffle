import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/TestPlansService.js', () => ({
    default: {
        getTestPlans: vi.fn(),
        getOne: vi.fn(),
        createTestPlan: vi.fn(),
        updateTestPlan: vi.fn(),
        getProgression: vi.fn(),
        addDemoAnswers: vi.fn(),
    },
}));

import TestPlansService from '../../../src/Services/PrivateApi/TestPlansService.js';
import {
    testPlanKeys,
    useTestPlans,
    useTestPlansPage,
    useTestPlan,
    useCreateTestPlan,
    useUpdateTestPlan,
    useAssignedTestPlans,
    useTestPlanProgression,
    useAddDemoAnswers,
} from '../../../src/Hooks/queries/useTestPlansQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('testPlanKeys', () => {
    it('list key includes params', () => {
        expect(testPlanKeys.list({project: 1})).toEqual(['testPlans', 'list', {project: 1}]);
    });
    it('detail key includes id', () => {
        expect(testPlanKeys.detail(5)).toEqual(['testPlans', 'detail', 5]);
    });
});

describe('useTestPlans', () => {
    it('is disabled when neither project nor release param', () => {
        const {result} = renderHook(() => useTestPlans({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches all pages when project param present', async () => {
        TestPlansService.getTestPlans
            .mockResolvedValueOnce({data: {member: [{id: 1}, {id: 2}], totalItems: 3}})
            .mockResolvedValueOnce({data: {member: [{id: 3}], totalItems: 3}});

        const {result} = renderHook(() => useTestPlans({project: 1}), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(3);
    });

    it('is enabled when release param present', () => {
        TestPlansService.getTestPlans.mockResolvedValue({data: {member: [], totalItems: 0}});
        const {result} = renderHook(() => useTestPlans({release: '/api/releases/1'}), {
            wrapper: makeWrapper(),
        });
        expect(result.current.fetchStatus).not.toBe('idle');
    });
});

describe('useTestPlansPage', () => {
    it('is disabled when neither release.project nor release param', () => {
        const {result} = renderHook(() => useTestPlansPage({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single page', async () => {
        TestPlansService.getTestPlans.mockResolvedValueOnce({
            data: {member: [{id: 1}]},
        });
        const {result} = renderHook(() => useTestPlansPage({'release.project': 1}), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{id: 1}]);
    });
});

describe('useTestPlan', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useTestPlan(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single test plan', async () => {
        TestPlansService.getOne.mockResolvedValueOnce({data: {id: 7, name: 'Plan A'}});
        const {result} = renderHook(() => useTestPlan(7), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({id: 7, name: 'Plan A'});
    });
});

describe('useCreateTestPlan', () => {
    it('calls createTestPlan', async () => {
        TestPlansService.createTestPlan.mockResolvedValueOnce({data: {id: 99}});
        const {result} = renderHook(() => useCreateTestPlan(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({name: 'New Plan', release: '/api/releases/1'});
        expect(data).toEqual({id: 99});
    });
});

describe('useUpdateTestPlan', () => {
    it('calls updateTestPlan with id and data', async () => {
        TestPlansService.updateTestPlan.mockResolvedValueOnce({data: {id: 7}});
        const {result} = renderHook(() => useUpdateTestPlan(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 7, data: {name: 'Updated'}});
        expect(TestPlansService.updateTestPlan).toHaveBeenCalledWith(7, {name: 'Updated'});
    });
});

describe('useAssignedTestPlans', () => {
    it('is disabled when testerIri is falsy', () => {
        const {result} = renderHook(() => useAssignedTestPlans(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches test plans for tester', async () => {
        TestPlansService.getTestPlans
            .mockResolvedValueOnce({data: {member: [{id: 1}], totalItems: 1}});
        const {result} = renderHook(
            () => useAssignedTestPlans('/api/testers/abc'),
            {wrapper: makeWrapper()}
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(TestPlansService.getTestPlans).toHaveBeenCalledWith(
            expect.objectContaining({testersEnrolled: '/api/testers/abc'})
        );
    });
});

describe('useTestPlanProgression', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useTestPlanProgression(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches progression', async () => {
        TestPlansService.getProgression.mockResolvedValueOnce({data: {progress: 80}});
        const {result} = renderHook(() => useTestPlanProgression(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({progress: 80});
    });
});

describe('useAddDemoAnswers', () => {
    it('calls addDemoAnswers', async () => {
        TestPlansService.addDemoAnswers.mockResolvedValueOnce({data: {added: 5}});
        const {result} = renderHook(() => useAddDemoAnswers(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({
            testingPlanIri: '/api/test_plans/1',
            number: 5,
        });
        expect(TestPlansService.addDemoAnswers).toHaveBeenCalledWith('/api/test_plans/1', 5);
        expect(data).toEqual({added: 5});
    });
});
