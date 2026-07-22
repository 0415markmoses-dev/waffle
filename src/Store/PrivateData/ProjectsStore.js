import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import createSelector from "../../Utils/store.createSelector.js";

// Stores only the selected project's id — never a snapshot of its fields
// (name, description, etc). Any component that needs display data should
// read it live via useProject(currentProjectId) / useGetCurrentProject(),
// so it can never go stale after an edit elsewhere.
export const useProjectStore = createSelector(create(persist((set) => ({
    currentProjectId: null,
    selectionModalVisible: false,
    openSelectionModal: () => set({selectionModalVisible: true}),
    closeSelectionModal: () => set({selectionModalVisible: false}),
    setCurrentProjectId: (id) => set({currentProjectId: id, selectionModalVisible: false}),
    clearCurrentProjectId: () => set({currentProjectId: null, selectionModalVisible: true}),
}), {
    name: 'testgator-projects-storage',
    partialize: (state) =>
        Object.fromEntries(
            Object.entries(state).filter(([key]) => !['selectionModalVisible'].includes(key)),
        ),
})));
