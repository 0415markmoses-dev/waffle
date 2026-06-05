import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import createSelector from "../../utils/store.createSelector.js";

export const useProjectStore = createSelector(create(persist((set) => ({
    currentProject: null,
    selectionModalVisible: false,
    openSelectionModal: () => set({selectionModalVisible: true}),
    closeSelectionModal: () => set({selectionModalVisible: false}),
    setCurrentProject: (projectData) => set({currentProject: projectData, selectionModalVisible: false}),
    clearCurrentProject: () => set({currentProject: null, selectionModalVisible: true}),
}), {
    name: 'testgator-projects-storage',
    partialize: (state) =>
        Object.fromEntries(
            Object.entries(state).filter(([key]) => !['selectionModalVisible'].includes(key)),
        ),
})));
