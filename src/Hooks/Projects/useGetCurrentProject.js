import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useProject} from "../queries/useProjectsQuery.js";

// Returns the LIVE project record for whatever project id is currently
// selected (persisted in useProjectStore) — always fresh via TanStack
// Query's cache, never a stale snapshot. `project` is undefined while
// loading or if nothing is selected yet; callers should guard on
// `projectId` for the "nothing selected" case, since that's available
// synchronously from the store.
export const useGetCurrentProject = () => {
    const {currentProjectId} = useProjectStore();
    const {data: project, isLoading, isError} = useProject(currentProjectId);

    return {project, projectId: currentProjectId, isLoading, isError};
};
