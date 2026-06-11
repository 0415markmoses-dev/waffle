import {useAuthStore, isTester} from "../Store/auth.js";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Button} from "../Components/UI/Buttons/Button.jsx";
import {AuthCodeInput} from "../Components/UI/Form/Inputs/AuthCodeInput.jsx";
import {Trans, useTranslation} from "react-i18next";
import {Row} from "../Components/UI/Grid/Row.jsx";
import {Col} from "../Components/UI/Grid/Col.jsx";
import {Separator} from "../Components/UI/Separator/Separator.jsx";
import {Alert} from "../Components/UI/Alert/Alert.jsx";


export const Login = () => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {user, isLoadingUser, requestLogin, generateCode} = useAuthStore();
    const [error, setError] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('none'); // none(default), team or tester
    const [hasCode, setHasCode] = useState(false);
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');

    console.log('code', code)

    useEffect(() => {
        // if query string mode=tester, set mode to tester
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('mode') && urlParams.get('mode') === 'tester') {
            setMode('tester');
        }
    }, [])

    useEffect(() => {
        if (user !== null && !isLoadingUser) {
            navigate(isTester(user) ? "/testing/" : "/app/");
        }
    }, [user, isLoadingUser]);

    const tryLogin = async (e) => {
        e.preventDefault();

        if (e.target[0].value === '' || e.target[0].value === undefined) {
            setError('Email is required');
            return;
        }

        setLoading(true);

        let email = e.target[0].value;
        if (mode === 'tester' && hasCode) {
            email = username;
        }
        let password = e.target[1].value;
        if (mode === 'tester' && hasCode) {
            password = code;
        }

        try {
            if (mode === 'team') {
                await requestLogin(email, password);
            } else if (mode === 'tester') {
                console.log('tester request login');
                await requestLogin(email, password, 'tester', 'app');
            }
        } catch (error) {
            console.error(error)
            setError('An error occurred');
        }
        setLoading(false);
    }

    const requestCode = async (e) => {
        e.preventDefault();
        setHasCode(false);

        if (e.target[0].value === '' || e.target[0].value === undefined) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError(undefined);

        const email = e.target[0].value;
        setUsername(email);

        try {
            await generateCode(email);
            setHasCode(true);
        } catch (error) {
            console.error(error)
            setError('An error occurred');
        }
        setLoading(false);
    }

    const handleSendForm = (e) => {
        if (mode === 'team') {
            tryLogin(e);
        } else {
            if (hasCode) {
                // do something with the code
                tryLogin(e);
            } else {
                requestCode(e);
            }
        }
    }

    if (isLoadingUser) {
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
                            {mode === 'none' && (
                                <>
                                    <div
                                        className="d-flex justify-content-center align-items-center flex-column gap-lg">
                                        <Button type="primary"
                                                icon="lni-bug-1"
                                                onClick={() => setMode('tester')}>
                                            {t('Login as Tester')}
                                        </Button>
                                        <Separator text={t('OR')}/>
                                        <Button type="light"
                                                icon="lni-user-multiple-4"
                                                onClick={() => setMode('team')}>
                                            {t('Login as Team Member')}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {mode !== 'none' && (
                                <>
                                    <form onSubmit={(e) => handleSendForm(e)}>
                                        <div className="w-100 mb-2">
                                            {error !== undefined && (
                                                <div className="alert alert-danger">
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                        {mode === 'tester' && hasCode && (
                                            <>
                                                <Alert type='info'>
                                                    {t('A code has been sent to your email.')}
                                                </Alert>
                                                <div className="form-group mt-3 mb-2">
                                                    <label className="mb-2">
                                                        {t('One time code')}
                                                    </label>
                                                    <AuthCodeInput codeLength={6}
                                                                   onChange={(code) => {
                                                                       console.log('me-code', code)
                                                                       setCode(code)
                                                                   }}/>
                                                </div>

                                            </>
                                        )}
                                        {!hasCode && (
                                            <div className="form-group mb-2">
                                                <label htmlFor="loginLogin">
                                                    {mode === 'team' ? t('Username') : t('Email')}
                                                </label>
                                                <input type="text" className="form-control" id="loginLogin"
                                                       disabled={loading}
                                                       aria-describedby="emailHelp"
                                                       placeholder={mode === 'team' ? 'john.doe' : 'john.doe@domain.tld'}/>
                                                {mode === 'team' && (
                                                    <small id="emailHelp" className="form-text text-muted">
                                                        <Trans i18nKey="Use your AD login name without the @domain.tld">
                                                            Use your AD login name <i>without the @domain.tld</i>
                                                        </Trans>
                                                    </small>
                                                )}
                                                {mode !== 'team' && (
                                                    <small id="emailHelp" className="form-text text-muted">
                                                        {t('Use the email you received your invitation to')}
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                        {mode === 'team' && (
                                            <div className="form-group mb-2">
                                                <label htmlFor="passwordLogin">{t('Password')}</label>
                                                <input type="password" className="form-control" id="passwordLogin"
                                                       disabled={loading} placeholder="**********"/>
                                            </div>
                                        )}
                                        <div className="form-group mt-4">
                                            {mode === 'team' && (
                                                <Button type="primary"
                                                        loading={loading}
                                                        fullWidth isSubmit
                                                        size="md">
                                                    {t('Login')}
                                                </Button>
                                            )}
                                            {mode !== 'team' && !hasCode && (
                                                <Button type="primary"
                                                        loading={loading}
                                                        fullWidth isSubmit
                                                        size="md">
                                                    {t('Request Code')}
                                                </Button>
                                            )}
                                            {mode !== 'team' && hasCode && (
                                                <Button type="primary"
                                                        loading={loading}
                                                        fullWidth isSubmit
                                                        size="md">
                                                    {t('Login')}
                                                </Button>
                                            )}
                                        </div>

                                    </form>
                                    <Separator className="mt-4 mb-4"/>
                                    <Button type="light" fullWidth size="sm"
                                            onClick={() => setMode('none')}>
                                        {t('Back')}
                                    </Button>
                                </>
                            )}

                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    </>
}
