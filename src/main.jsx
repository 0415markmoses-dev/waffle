import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './Style/main.scss'
import {router} from "./Router/main.jsx";
import {RouterProvider} from "react-router-dom";
import {getCurrentUserData} from "./store/auth.js";

getCurrentUserData();


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <div className="main-content">
            <RouterProvider router={router}/>
        </div>
    </StrictMode>,
)
