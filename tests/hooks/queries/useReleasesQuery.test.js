import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/ReleasesService.js', () => ({
    default: {
        getReleases: vi.fn(),
        getRelease: vi.fn(),
        getReleaseStats: vi.fn(),
        createRelease: vi.fn(),
        updateRelease: vi.fn(),
    },
}));

import ReleasesService from '../../../src/Services/PrivateApi/ReleasesService.js';
import {
    releaseKeys,
    useReleases,
    useRelease,
    useReleaseStats,
    useCreateRelease,
    useUpdateRelease,
} from '../../../src/Hooks/queries/useReleasesQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('releaseKeys', () => {
    it('list key includes params', () => {
        expect(releaseKeys.list({project: 1})).toEqual(['releases', 'list', {project: 1}]);
    });
    it('stats key includes id', () => {
        expect(releaseKeys.stats(2)).toEqual(['releases', 'stats', 2]);
    });
});

describe('useReleases', () => {
    it('is disabled when project param is missing', () => {
        const {result} = renderHook(() => useReleases({}), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches all pages and flattens', async () => {
        ReleasesService.getReleases
            .mockResolvedValueOnce({data: {member: [{id: 1}], totalItems: 2}})
            .mockResolvedValueOnce({data: {member: [{id: 2}], totalItems: 2}});

        const {result} = renderHook(() => useReleases({project: 1}), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toHaveLength(2);
    });
});

describe('useRelease', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useRelease(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single release', async () => {
        ReleasesService.getRelease.mockResolvedValueOnce({data: {id: 3, name: 'v1.0'}});
        const {result} = renderHook(() => useRelease(3), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({id: 3, name: 'v1.0'});
    });
});

describe('useReleaseStats', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useReleaseStats(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches release stats', async () => {
        ReleasesService.getReleaseStats.mockResolvedValueOnce({data: {pass: 5}});
        const {result} = renderHook(() => useReleaseStats(3), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({pass: 5});
    });
});

describe('useCreateRelease', () => {
    it('calls createRelease', async () => {
        ReleasesService.createRelease.mockResolvedValueOnce({data: {id: 10}});
        const {result} = renderHook(() => useCreateRelease(), {wrapper: makeWrapper()});
        const data = await result.current.mutateAsync({name: 'v2.0', project: '/api/projects/1'});
        expect(data).toEqual({id: 10});
    });
});

describe('useUpdateRelease', () => {
    it('calls updateRelease with id and data', async () => {
        ReleasesService.updateRelease.mockResolvedValueOnce({data: {id: 10}});
        const {result} = renderHook(() => useUpdateRelease(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 10, data: {name: 'v2.1'}});
        expect(ReleasesService.updateRelease).toHaveBeenCalledWith(10, {name: 'v2.1'});
    });
});
