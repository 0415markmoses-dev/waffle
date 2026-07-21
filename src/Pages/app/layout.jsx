import {Outlet} from "react-router-dom";
import {NavBar} from "../../Components/Navigation/NavBar.jsx";
import {TopBar} from "../../Components/Navigation/TopBar.jsx";
import {Footer} from "../../Components/Navigation/Footer.jsx";
import {useEffect} from "react";
import {ModalSelectProject} from "../../Components/Projects/ModalSelectProject.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useProject} from "../../Hooks/queries/useProjectsQuery.js";

export const Layout = () => {
    const {currentProject, openSelectionModal, clearCurrentProject} = useProjectStore();

    // Keep project data fresh; if it 404s or errors, reset and show selector
    const {isError} = useProject(currentProject?.id);

    useEffect(() => {
        if (!currentProject?.id) {
            openSelectionModal();
        }
    }, [currentProject?.id, openSelectionModal]);

    useEffect(() => {
        if (isError) {
            clearCurrentProject();
        }
    }, [isError, clearCurrentProject]);

    return <>
        <div className="w-100 app-wrapper">
            <NavBar/>
            <TopBar/>
            <div className="app-pages-content flex-grow-1">
                <Outlet/>
                <Footer/>
            </div>
        </div>
        <ModalSelectProject/>
    </>
}
