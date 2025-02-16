import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";

export const useGetCurrentProject = () => {
    const {currentProject} = useProjectStore();
    console.log('currentProject', currentProject);

    return currentProject;
}
