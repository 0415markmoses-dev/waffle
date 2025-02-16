import {Outlet} from "react-router-dom";
import {NavBar} from "../../Components/Navigation/NavBar.jsx";
import {Footer} from "../../Components/Navigation/Footer.jsx";
import {useAuthStore} from "../../Store/auth.js";
import {useEffect} from "react";
import {useNavigate} from "react-router";
import {ModalSelectProject} from "../../Components/Projects/ModalSelectProject.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";

export const Layout = () => {
    let navigate = useNavigate();
    const {user} = useAuthStore();
    const {projectInit} = useProjectStore();

    useEffect(() => {
        projectInit();
    }, []);

    useEffect(() => {
        if (user?.id === null || user?.id === undefined) {
            navigate("/");
        }
    }, [user]);

    return <>
        <div className="w-100 app-wrapper">
            <NavBar/>
            <div className="app-pages-content flex-grow-1">
                <Outlet/>
                <Footer/>
            </div>
        </div>
        <ModalSelectProject/>
    </>
}
