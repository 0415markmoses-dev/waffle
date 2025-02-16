import {create} from 'zustand'
import {persist} from 'zustand/middleware'
//import {produce} from 'immer';
import createSelector from "../../utils/store.createSelector.js";
import ProjectService from "../../Services/PrivateApi/ProjectService.js";


export const useProjectStore = createSelector(create(persist((set) => ({
    currentProject: null,
    selectionModalVisible: false,
    openSelectionModal: () => set({selectionModalVisible: true}),
    closeSelectionModal: () => set({selectionModalVisible: false}),
    setCurrentProject: projectData => {
        set({currentProject: projectData});
        useProjectStore.getState().loadProjectData();
    },
    loadProjectData: () => {
        // update currentProjectData if currentProject?.id is not undefined
        if (useProjectStore.getState().currentProject?.id !== undefined) {
            ProjectService.getProject(useProjectStore.getState().currentProject?.id)
                .then((response) => {
                    if (response.data !== undefined) {
                        set({currentProject: response.data});
                    }
                })
                .catch((error) => {
                    console.error(error);
                    set({currentProject: null});
                    useProjectStore.getState().openSelectionModal();
                });
        } else {
            useProjectStore.getState().openSelectionModal();
        }
    },
    projectInit: () => {
        useProjectStore.getState().loadProjectData();
    }
}), {
    name: 'testgator-projects-storage',
    partialize: (state) =>
        Object.fromEntries(
            Object.entries(state).filter(([key]) => !['selectionModalVisible'].includes(key)),
        ),
})));

export const getCurrentProject = () => {
    return useProjectStore.use.currentProject();
}

