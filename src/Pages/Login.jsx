import {useAuthStore} from "../Store/auth.js";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Button} from "../Components/UI/Buttons/Button.jsx";
import {useTranslation} from "react-i18next";
import {Row} from "../Components/UI/Grid/Row.jsx";
import {Col} from "../Components/UI/Grid/Col.jsx";
import AuthService from "../Services/Authentication/AuthService.js";


export const Login = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user, isLoadingUser, requestLogin} = useAuthStore();
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [serverAuthMode, setServerAuthMode] = useState(null);
    const [fetchingAuthMode, setFetchingAuthMode] = useState(true);

    useEffect(() => {
        AuthService.getAuthMode()
            .then(r => setServerAuthMode(r.data))
            .catch(() => setServerAuthMode({mode: 'ldap', usernameIsEmail: false}))
            .finally(() => setFetchingAuthMode(false));
    }, []);

    useEffect(() => {
        if (user !== null && !isLoadingUser) {
            navigate('/app/');
        }
    }, [user, isLoadingUser, navigate]);

    const tryLogin = async (e) => {
        e.preventDefault();

        const usernameValue = e.target[0]?.value?.trim();
        const passwordValue = e.target[1]?.value ?? '';

        if (!usernameValue) {
            setError('Username is required');
            return;
        }

        if (!passwordValue) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            await requestLogin(usernameValue, passwordValue, 'team', serverAuthMode?.mode ?? 'db');
        } catch (error) {
            console.error(error);
            setError('An error occurred');
        }
        setLoading(false);
    }

    const handleSendForm = (e) => {
        tryLogin(e);
    }

    if (isLoadingUser || fetchingAuthMode) {
        return (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center"
                 style={{minHeight: '100vh'}}>
                <div className="d-flex flex-column align-items-center gap-md">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading…</span>
                    </div>
                    <p className="text-muted small m-0">Signing you in…</p>
                </div>
            </div>
        );
    }

    return <>
        <div className="w-100 login-container position-relative">
            <Row className="h-100">
                <Col fullHeight className="bg-secondary login-col"
                     size={12} minSizeDisplay="md"
                     md={5} lg={6}>
                    <div className="w-100 h-100">

                    </div>
                </Col>
                <Col fullHeight className="d-flex justify-content-center align-items-center bg-white"
                     size={12}
                     sm={12} md={7} lg={6}>
                    <div className="w-100 p-4 h-fit">
                        <div className="login-width">
                            <div className="card-login-header mb-4">
                                <div
                                    className="project-meta flex-grow-0 d-flex justify-content-center align-items-center mb-2">
                                    <div className="project-picture-wrapper size-xxl">
                                        <img src="/assets/gator_avatar.png" alt=""/>
                                    </div>
                                </div>
                                <h1 className="text-center m-0 fs-4">
                                    {t('Login to TestGator')}
                                </h1>
                            </div>
                            <form onSubmit={(e) => handleSendForm(e)}>
                                <div className="w-100 mb-2">
                                    {error !== undefined && (
                                        <div className="alert alert-danger">
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group mb-2">
                                    <label htmlFor="loginLogin">{t('Username')}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="loginLogin"
                                        disabled={loading}
                                        placeholder="ForestLuau"
                                    />
                                </div>
                                <div className="form-group mb-2">
                                    <label htmlFor="passwordLogin">{t('Password')}</label>
                                    <input type="password" className="form-control" id="passwordLogin"
                                           disabled={loading} placeholder="**********"/>
                                </div>
                                <div className="form-group mt-4">
                                    <Button type="primary"
                                            loading={loading}
                                            fullWidth isSubmit
                                            size="md">
                                        {t('Login')}
                                    </Button>
                                </div>
                            </form>

                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </>
}
