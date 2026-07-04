import {renderHook} from '@testing-library/react';

// Mock zustand store to avoid localStorage persistence issues in tests
const mockUseProjectStore = vi.fn();
vi.mock('../../../src/Store/PrivateData/ProjectsStore.js', () => ({
    useProjectStore: (selector) => mockUseProjectStore(selector),
}));

import {useGetCurrentProject} from '../../../src/Hooks/Projects/useGetCurrentProject.js';

describe('useGetCurrentProject', () => {
    it('returns null when no project is selected', () => {
        mockUseProjectStore.mockImplementation((selector) =>
            selector ? selector({currentProject: null}) : null
        );
        // The hook calls useProjectStore destructuring — mock the whole store
        mockUseProjectStore.mockReturnValue({currentProject: null});

        const {result} = renderHook(() => useGetCurrentProject());
        expect(result.current).toBeNull();
    });

    it('returns the current project when one is set', () => {
        const project = {id: 42, name: 'Test Project'};
        mockUseProjectStore.mockReturnValue({currentProject: project});

        const {result} = renderHook(() => useGetCurrentProject());
        expect(result.current).toEqual(project);
    });
});
