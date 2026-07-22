import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {useGetCurrentProject} from "../../../../Hooks/Projects/useGetCurrentProject.js";
import {useNavigate} from "react-router";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {Trans, useTranslation} from "react-i18next";
import {ListTesters} from "../../../../Components/Testers/ListTesters.jsx";
import {ModalCreateNewTester} from "../../../../Components/Testers/ModalCreateNewTester.jsx";
import {useState} from "react";

export const Page = () => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {project: currentProject, projectId: currentProjectId} = useGetCurrentProject();
    const [modalVisible, setModalVisible] = useState(false);

    const handleNewReleaseClick = () => {
        //navigate('/app/project/testers/create');
        setModalVisible(true);
    }

    if (currentProjectId === undefined || currentProjectId === null) {
        // Redirect to dashboard
        navigate('/app/');
        return null;
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={(currentProject?.name ?? '') + " - " + t('All Testers')}>
                <Button icon="lni-plus" onClick={handleNewReleaseClick}
                        type="primary" size="sm">{t('Create tester')}</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col fullHeight sm={12} xl={8}>
                        <Row className="h-100">
                            <Col fullHeight size={12}>
                                <ListTesters/>
                            </Col>
                        </Row>
                    </Col>
                    <Col fullHeight sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card isAppCard={true}>
                                    <CardHeader title={t('What is a tester?')}/>
                                    <CardBody>
                                        <div className="d-flex x">
                                            <img className="w-75 mx-auto" src="/assets/testers.png" alt="notif"/>
                                        </div>
                                        <Trans i18nKey='What is a tester description'>
                                            <p>
                                                In TestGator, a <b>Tester</b> is someone who <b>helps you validate your
                                                features</b>
                                                before release.
                                            </p>
                                            <p>
                                                Testers are usually <b>non-technical users</b>—like clients, team
                                                members, or end-users—who receive a simple and secure link to try out
                                                specific scenarios you define. They don&apos;t need to install anything.
                                            </p>
                                            <p>
                                                Their job is to follow your instructions,<b> give quick feedback</b>
                                                like PASS, PASS (with bug), or FAILED, and optionally attach comments,
                                                screenshots, or files.
                                            </p>
                                        </Trans>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </PageElementWrapper>
        </PageContentWrapper>
        <ModalCreateNewTester
            onConfirm={() => setModalVisible(false)}
            onCancel={() => setModalVisible(false)}
            isVisible={modalVisible}/>
    </>
}
