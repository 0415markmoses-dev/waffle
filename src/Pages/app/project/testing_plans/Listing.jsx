import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Trans, useTranslation} from "react-i18next";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {ListTestPlans} from "../../../../Components/TestPlans/ListTestPlans.jsx";
import {CreateTestPlanButton} from "../../../../Components/TestPlans/ModalCreateTestPlan.jsx";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {useNavigate} from "react-router";

export const Listing = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {currentProject} = useProjectStore();

    if (currentProject?.id === undefined) {
        navigate('/app/');
        return null;
    }

    return (
        <PageContentWrapper>
            <PageTitle title={currentProject.name + " - " + t('All Testing Plans')}>
                <CreateTestPlanButton/>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col fullHeight sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardHeader title={t('What is a testing plan?')}/>
                                    <CardBody>
                                        <Trans i18nKey="What is a testing plan description">
                                            <p>A <strong>testing plan</strong> is a structured set of
                                                <strong> questions</strong> assigned to testers within a release.
                                                It targets a specific functionality or user flow and collects
                                                real feedback before deployment.</p>
                                        </Trans>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col fullHeight sm={12} xl={8}>
                        <Row className="h-100">
                            <Col fullHeight size={12}>
                                <ListTestPlans/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
