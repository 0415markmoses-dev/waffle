import {Outlet} from "react-router-dom";
import {NavBar} from "../../Components/Navigation/NavBar.jsx";
import {TopBar} from "../../Components/Navigation/TopBar.jsx";
import {Footer} from "../../Components/Navigation/Footer.jsx";
import {useAuthStore} from "../../Store/auth.js";
import {useEffect} from "react";
import {useNavigate} from "react-router";

export const Layout = () => {
    let navigate = useNavigate();
    const {user} = useAuthStore();

    useEffect(() => {
        if (user?.id === null || user?.id === undefined) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="w-100 app-wrapper">
            <NavBar menuName="testing-navbar"/>
            <TopBar/>
            <div className="app-pages-content flex-grow-1">
                <Outlet/>
                <Footer/>
            </div>
        </div>
    );
}
