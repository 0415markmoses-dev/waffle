// generate context
import {createContext} from "react";

export const TabsContext = createContext({
    id: '',
    setId: (id) => {
    },
    activeTab: undefined,
    setActiveTab: (activeTab) => {
    }
});
