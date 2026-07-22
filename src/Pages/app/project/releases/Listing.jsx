import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {ListReleases} from "../../../../Components/Releases/ListReleases.jsx";
import {useGetCurrentProject} from "../../../../Hooks/Projects/useGetCurrentProject.js";
import {useNavigate} from "react-router";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {Trans, useTranslation} from "react-i18next";

export const Listing = () => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {project: currentProject, projectId: currentProjectId} = useGetCurrentProject();

    const handleNewReleaseClick = () => {
        navigate('/app/project/releases/create');
    }

    if (currentProjectId === undefined || currentProjectId === null) {
        // Redirect to dashboard
        navigate('/app/');
        return null;
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={(currentProject?.name ?? '') + " - " + t('All Releases')}>
                <Button icon="lni-plus" onClick={handleNewReleaseClick}
                        type="primary" size="sm">{t('New release')}</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col fullHeight sm={12} xl={8}>
                        <Row className="h-100">
                            <Col fullHeight size={12}>
                                <ListReleases/>
                            </Col>
                        </Row>
                    </Col>
                    <Col fullHeight sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card isAppCard={true}>
                                    <CardHeader title={t('What is a release?')}/>
                                    <CardBody>
                                        <div className="d-flex x">
                                            <img className="w-75 mx-auto" src="/assets/releases.png" alt="notif"/>
                                        </div>
                                        <Trans i18nKey="What is a release listing description">
                                            <p>In <strong>TestGator</strong>, a <strong>release</strong> represents a
                                                specific version or milestone of a project that requires testing before
                                                deployment. Each release serves as a container for multiple <strong>testing
                                                    plans</strong>, which are assigned to selected testers.</p>
                                            <p>These testing plans outline structured <strong>questions</strong>—feature
                                                scenarios that testers must follow and evaluate. Within a release,
                                                different testing plans can target various functionalities, user flows,
                                                or devices, allowing teams to validate multiple aspects of the software
                                                simultaneously.</p>
                                            <p>By organizing testing efforts into releases, developers can
                                                systematically track progress, collect structured feedback, and ensure
                                                that each iteration of the project meets quality expectations before
                                                moving forward.</p>
                                        </Trans>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
