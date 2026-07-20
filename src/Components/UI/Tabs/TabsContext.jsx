// generate context
import {createContext} from "react";

export const TabsContext = createContext({
    id: '',
    setId: () => {
    },
    activeTab: undefined,
    setActiveTab: () => {
    }
});
