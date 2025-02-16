import {useAuthStore} from "../store/auth.js";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {NavBar} from "../Components/Navigation/NavBar.jsx";


export const Login = () => {
    let navigate = useNavigate();
    const {user, requestLogin} = useAuthStore();
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user !== null) {
            navigate("/app/");
        }
    }, [user]);

    const tryLogin = async (e) => {
        e.preventDefault();

        if (e.target[0].value === '' || e.target[0].value === undefined) {
            setError('Email is required');
            return;
        }

        setLoading(true);

        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            await requestLogin(email, password);
        } catch (error) {
            console.error(error)
            setError('An error occurred');
        }
        setLoading(false);
    }

    return <>
        <div className="container-fluid login-container">
            <div className="row">
                <div className="col-12 x">
                    <div className="card login-width">
                        <div className="card-body">
                            <div className="card-login-header mb-4">
                                <div
                                    className="project-meta flex-grow-0 d-flex justify-content-center align-items-center mb-2">
                                    <div className="project-picture-wrapper size-xxl">
                                        <img src="/assets/gator_avatar.png" alt=""/>
                                    </div>
                                </div>
                                <h1 className="text-center m-0 fs-4">
                                    Login to TestGator
                                </h1>
                            </div>
                            <form onSubmit={(e) => tryLogin(e)}>
                                <div className="w-100 mb-2">
                                    {error !== undefined && (
                                        <div className="alert alert-danger">
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group mb-2">
                                    <label htmlFor="loginLogin">Username</label>
                                    <input type="text" className="form-control" id="loginLogin"
                                           disabled={loading}
                                           aria-describedby="emailHelp" placeholder="john.doe"/>
                                    <small id="emailHelp" className="form-text text-muted">
                                        Use your AD login name <i>without the @domain.tld</i>
                                    </small>
                                </div>
                                <div className="form-group mb-2">
                                    <label htmlFor="passwordLogin">Password</label>
                                    <input type="password" className="form-control" id="passwordLogin"
                                           disabled={loading} placeholder="**********"/>
                                </div>
                                <div className="form-group mt-4">
                                    <button type="submit"
                                            disabled={loading}
                                            className="btn btn-primary w-100">Login
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </>
}
