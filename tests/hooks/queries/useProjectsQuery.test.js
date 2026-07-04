import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

vi.mock('../../../src/Services/PrivateApi/ProjectService.js', () => ({
    default: {
        getProjects: vi.fn(),
        getProject: vi.fn(),
        updateProject: vi.fn(),
        getStats: vi.fn(),
    },
}));

import ProjectService from '../../../src/Services/PrivateApi/ProjectService.js';
import {
    projectKeys,
    useProjects,
    useProject,
    useUpdateProject,
    useProjectStats,
    useInvalidateProjects,
} from '../../../src/Hooks/queries/useProjectsQuery.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('projectKeys', () => {
    it('list key includes params', () => {
        expect(projectKeys.list({search: 'foo'})).toEqual(['projects', 'list', {search: 'foo'}]);
    });
    it('detail key includes id', () => {
        expect(projectKeys.detail(3)).toEqual(['projects', 'detail', 3]);
    });
});

describe('useProjects', () => {
    it('fetches projects (always enabled)', async () => {
        ProjectService.getProjects.mockResolvedValueOnce({data: {member: [{id: 1}]}});
        const {result} = renderHook(() => useProjects(), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(ProjectService.getProjects).toHaveBeenCalledWith({});
    });

    it('passes params to getProjects', async () => {
        ProjectService.getProjects.mockResolvedValueOnce({data: []});
        const {result} = renderHook(() => useProjects({search: 'acme'}), {
            wrapper: makeWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(ProjectService.getProjects).toHaveBeenCalledWith({search: 'acme'});
    });
});

describe('useProject', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useProject(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches single project', async () => {
        ProjectService.getProject.mockResolvedValueOnce({data: {id: 5, name: 'MyApp'}});
        const {result} = renderHook(() => useProject(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({id: 5, name: 'MyApp'});
    });
});

describe('useUpdateProject', () => {
    it('calls updateProject with id and data', async () => {
        ProjectService.updateProject.mockResolvedValueOnce({data: {id: 5}});
        const {result} = renderHook(() => useUpdateProject(), {wrapper: makeWrapper()});
        await result.current.mutateAsync({id: 5, data: {name: 'Updated'}});
        expect(ProjectService.updateProject).toHaveBeenCalledWith(5, {name: 'Updated'});
    });
});

describe('useProjectStats', () => {
    it('is disabled when id is falsy', () => {
        const {result} = renderHook(() => useProjectStats(null), {wrapper: makeWrapper()});
        expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches stats for project', async () => {
        ProjectService.getStats.mockResolvedValueOnce({data: {testers: 10, plans: 3}});
        const {result} = renderHook(() => useProjectStats(5), {wrapper: makeWrapper()});
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({testers: 10, plans: 3});
    });
});

describe('useInvalidateProjects', () => {
    it('returns a function that invalidates projects queries', async () => {
        const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
        const wrapper = ({children}) => createElement(QueryClientProvider, {client: qc}, children);
        const {result} = renderHook(() => useInvalidateProjects(), {wrapper});
        expect(typeof result.current).toBe('function');
        // should not throw when called
        expect(() => result.current()).not.toThrow();
    });
});
