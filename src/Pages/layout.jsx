import {Outlet} from "react-router-dom";
import {NavBar} from "../Components/Navigation/NavBar.jsx";
import {Footer} from "../Components/Navigation/Footer.jsx";

export const Layout = () => {
    return <>
        <NavBar/>
        <div className="container page-container">
            <Outlet/>
        </div>
        <Footer/>
    </>
}
