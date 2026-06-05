import {Outlet} from "react-router-dom";
import {NavBar} from "../../Components/Navigation/NavBar.jsx";
import {TopBar} from "../../Components/Navigation/TopBar.jsx";
import {Footer} from "../../Components/Navigation/Footer.jsx";
import {useAuthStore} from "../../Store/auth.js";
import {useEffect} from "react";
import {useNavigate} from "react-router";
import {ModalSelectProject} from "../../Components/Projects/ModalSelectProject.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useProject} from "../../Hooks/queries/useProjectsQuery.js";

export const Layout = () => {
    let navigate = useNavigate();
    const {user} = useAuthStore();
    const {currentProject, openSelectionModal, clearCurrentProject} = useProjectStore();

    // Keep project data fresh; if it 404s or errors, reset and show selector
    const {isError} = useProject(currentProject?.id);

    useEffect(() => {
        if (!currentProject?.id) {
            openSelectionModal();
        }
    }, [currentProject?.id]);

    useEffect(() => {
        if (isError) {
            clearCurrentProject();
        }
    }, [isError]);

    useEffect(() => {
        if (user?.id === null || user?.id === undefined) {
            navigate("/");
        }
    }, [user]);

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
