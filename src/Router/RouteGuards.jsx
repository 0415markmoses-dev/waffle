import {Navigate} from "react-router-dom";
import {useAuthStore, isTester} from "../Store/auth.js";
import {Loader} from "../Components/UI/Loader.jsx";
import {Layout as AppLayout} from "../Pages/app/layout.jsx";
import {Layout as TestingLayout} from "../Pages/testing/layout.jsx";

const AuthLoader = () => (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
        <Loader/>
    </div>
);

/** /app — team members only */
export const ProtectedRoute = () => {
    const {user, isLoadingUser} = useAuthStore();
    if (isLoadingUser) return <AuthLoader/>;
    if (!user?.id) return <Navigate to="/login" replace/>;
    if (isTester(user)) return <Navigate to="/testing/" replace/>;
    return <AppLayout/>;
};

/** /testing — testers only */
export const TestingRoute = () => {
    const {user, isLoadingUser} = useAuthStore();
    if (isLoadingUser) return <AuthLoader/>;
    if (!user?.id) return <Navigate to="/login" replace/>;
    if (!isTester(user)) return <Navigate to="/app/" replace/>;
    return <TestingLayout/>;
};
