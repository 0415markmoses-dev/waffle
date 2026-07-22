import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createElement} from 'react';

// Mock zustand store to avoid localStorage persistence issues in tests
const mockUseProjectStore = vi.fn();
vi.mock('../../../src/Store/PrivateData/ProjectsStore.js', () => ({
    useProjectStore: (selector) => mockUseProjectStore(selector),
}));

vi.mock('../../../src/Services/PrivateApi/ProjectService.js', () => ({
    default: {
        getProject: vi.fn(),
    },
}));

import ProjectService from '../../../src/Services/PrivateApi/ProjectService.js';
import {useGetCurrentProject} from '../../../src/Hooks/Projects/useGetCurrentProject.js';

const makeWrapper = () => {
    const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
    return ({children}) => createElement(QueryClientProvider, {client: qc}, children);
};

beforeEach(() => vi.clearAllMocks());

describe('useGetCurrentProject', () => {
    it('returns no project and no id when none is selected', () => {
        mockUseProjectStore.mockReturnValue({currentProjectId: null});

        const {result} = renderHook(() => useGetCurrentProject(), {wrapper: makeWrapper()});

        expect(result.current.projectId).toBeNull();
        expect(result.current.project).toBeUndefined();
        expect(ProjectService.getProject).not.toHaveBeenCalled();
    });

    it('fetches and returns the live project for the selected id', async () => {
        mockUseProjectStore.mockReturnValue({currentProjectId: 42});
        ProjectService.getProject.mockResolvedValueOnce({data: {id: 42, name: 'Test Project'}});

        const {result} = renderHook(() => useGetCurrentProject(), {wrapper: makeWrapper()});

        expect(result.current.projectId).toBe(42);
        await waitFor(() => expect(result.current.project).toEqual({id: 42, name: 'Test Project'}));
        expect(ProjectService.getProject).toHaveBeenCalledWith(42);
    });
});
