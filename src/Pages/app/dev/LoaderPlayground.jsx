import {useState} from "react";
import {PageContentWrapper} from "../../../Components/Navigation/PageContentWrapper.jsx";
import {PageElementWrapper} from "../../../Components/Navigation/PageElementWrapper.jsx";
import {PageTitle} from "../../../Components/Navigation/PageTitle.jsx";
import {Card} from "../../../Components/UI/Card/Card.jsx";
import {CardHeader} from "../../../Components/UI/Card/CardHeader.jsx";
import {CardBody} from "../../../Components/UI/Card/CardBody.jsx";
import {Loader} from "../../../Components/UI/Loader.jsx";
import {Button} from "../../../Components/UI/Buttons/Button.jsx";

const BUTTON_TYPES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const BUTTON_SIZES = ['sm', 'md', 'lg'];

/**
 * Dev-only page for eyeballing and debugging every loading state used across the app:
 * the standalone <Loader/> spinner, <Button loading/> across types/sizes, and a
 * simulated async fetch so you can see how a real isLoading flip looks in context.
 */
export const LoaderPlayground = () => {
    const [standaloneLoading, setStandaloneLoading] = useState(true);
    const [buttonsLoading, setButtonsLoading] = useState(false);
    const [overlayLoading, setOverlayLoading] = useState(false);
    const [simLoading, setSimLoading] = useState(false);

    const runSimulatedFetch = () => {
        setSimLoading(true);
        setTimeout(() => setSimLoading(false), 2000);
    };

    const runOverlay = () => {
        setOverlayLoading(true);
        setTimeout(() => setOverlayLoading(false), 2000);
    };

    return (
        <PageContentWrapper>
            <PageTitle title="Loader Playground" noBreadcrumb/>
            <PageElementWrapper>
                <div className="d-flex flex-column gap-lg">

                    {/* Standalone Loader component */}
                    <Card>
                        <CardHeader title="Loader component (spinner-border)">
                            <Button size="sm" type="secondary" outline
                                    onClick={() => setStandaloneLoading(v => !v)}>
                                {standaloneLoading ? 'Hide' : 'Show'}
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div style={{minHeight: 80}} className="d-flex align-items-center">
                                {standaloneLoading ? <Loader/> : <span className="text-muted">Loader hidden</span>}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Simulated async fetch, mirrors the isLoading pattern used on Home.jsx */}
                    <Card>
                        <CardHeader title="Simulated fetch (2s) — mirrors real isLoading usage">
                            <Button size="sm" type="primary" onClick={runSimulatedFetch} disabled={simLoading}>
                                Trigger
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div style={{minHeight: 80}} className="d-flex align-items-center">
                                {simLoading && <Loader/>}
                                {!simLoading && <span className="text-muted">Idle — click Trigger</span>}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Button loading states across all types/sizes */}
                    <Card>
                        <CardHeader title="Button loading states (is-loading)">
                            <Button size="sm" type="secondary" outline
                                    onClick={() => setButtonsLoading(v => !v)}>
                                {buttonsLoading ? 'Stop loading' : 'Set loading'}
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div className="d-flex flex-column gap-md">
                                {BUTTON_SIZES.map(size => (
                                    <div key={size} className="d-flex flex-wrap gap-sm align-items-center">
                                        <span className="text-muted" style={{width: 40}}>{size}</span>
                                        {BUTTON_TYPES.map(type => (
                                            <Button key={type + size} type={type} size={size} loading={buttonsLoading}>
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Fullscreen overlay loader, same markup as AuthLoader in Router/main.jsx */}
                    <Card>
                        <CardHeader title="Fullscreen overlay (AuthLoader style, 2s)">
                            <Button size="sm" type="primary" onClick={runOverlay} disabled={overlayLoading}>
                                Trigger
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <span
                                className="text-muted">Simulates the loader shown while auth/user state resolves.</span>
                        </CardBody>
                    </Card>

                </div>
            </PageElementWrapper>

            {overlayLoading && (
                <div
                    className="w-100 h-100 d-flex justify-content-center align-items-center position-fixed top-0 start-0"
                    style={{minHeight: '100vh', background: 'rgba(255,255,255,0.85)', zIndex: 2000}}
                >
                    <Loader/>
                </div>
            )}
        </PageContentWrapper>
    );
};
