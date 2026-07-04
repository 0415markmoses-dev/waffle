import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/TestersService.js', () => ({
    default: {
        getTesters: vi.fn(),
        getTester: vi.fn(),
        createTester: vi.fn(),
        updateTester: vi.fn(),
    },
}));

import TestersService from '../../../src/Services/PrivateApi/TestersService.js';
import {
    testerKeys,
    useTesters,
    useTester,
    useCreateTester,
    useUpdateTester,
} from '../../../src/Hooks/queries/useTestersQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('testerKeys', () => {
    it('list key includes params', () => {
        expect(testerKeys.list({project: 1})).toEqual(['testers', 'list', {project: 1}]);
    });
    it('detail key includes id', () => {
        expect(testerKeys.detail('abc')).toEqual(['testers', 'detail', 'abc']);
    });
});

describe('useTesters', () => {
    it('is disabled when project param is missing', () => {
        const {result} = renderHook(() => useTesters({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches all pages and flattens', async () => {
        TestersService.getTesters
            .mockResolvedValueOnce({data: {member: [{id: 1}, {id: 2}], totalItems: 3}})
            .mockResolvedValueOnce({data: {member: [{id: 3}], totalItems: 3}});

        const {result} = renderHook(() => useTesters({project: 1}), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(3);
    });
});

describe('useTester', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useTester(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single tester', async () => {
        const tester = {id: 'uuid-1', name: 'Alice'};
        TestersService.getTester.mockResolvedValueOnce({data: tester});
        const {result} = renderHook(() => useTester('uuid-1'), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(tester);
    });
});

describe('useCreateTester', () => {
    it('calls createTester', async () => {
        TestersService.createTester.mockResolvedValueOnce({data: {id: 'new-uuid'}});
        const {result} = renderHook(() => useCreateTester(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({email: 'test@example.com'});
        expect(data).toEqual({id: 'new-uuid'});
    });
});

describe('useUpdateTester', () => {
    it('calls updateTester with id and data', async () => {
        TestersService.updateTester.mockResolvedValueOnce({data: {id: 'uuid-1'}});
        const {result} = renderHook(() => useUpdateTester(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 'uuid-1', data: {name: 'Bob'}});
        expect(TestersService.updateTester).toHaveBeenCalledWith('uuid-1', {name: 'Bob'});
    });
});
