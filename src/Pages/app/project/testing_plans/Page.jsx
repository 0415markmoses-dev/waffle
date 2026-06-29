import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {useNavigate, useParams} from "react-router";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {CardFooter} from "../../../../Components/UI/Card/CardFooter.jsx";
import {useState} from "react";
import {Error404} from "../../../../Components/UI/Error404.jsx";
import {SingleMetricDisplay} from "../../../../Components/UI/Metrics/SingleMetricDisplay.jsx";
import {MetricVerticalSeparator} from "../../../../Components/UI/Metrics/MetricVerticalSeparator.jsx";
import {ProgressBar} from "../../../../Components/UI/Metrics/ProgressBar.jsx";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {CardGroup} from "../../../../Components/UI/Card/CardGroup.jsx";
import {ReleaseDescription} from "../../../../Components/Releases/ReleaseDescription.jsx";
import {TabWrapper} from "../../../../Components/UI/Tabs/TabWrapper.jsx";
import {Tab} from "../../../../Components/UI/Tabs/Tab.jsx";
import {Trans, useTranslation} from "react-i18next";
import {ErrorState} from "../../../../Components/UI/ErrorState.jsx";
import {TestersListingInTestPlan} from "../../../../Components/Testers/TestersListingInTestPlan.jsx";
import {EditTestPlanForm} from "../../../../Components/TestPlans/EditTestPlanForm.jsx";
import {Separator} from "../../../../Components/UI/Separator/Separator.jsx";
import {AgGridDisplay} from "../../../../Configs/AgGrid/AgGridDisplay.js";
import {ModalChangeTestPlanState} from "../../../../Components/TestPlans/ModalChangeTestPlanState.jsx";
import {ListQuestionsOrdered} from "../../../../Components/Questions/ListQuestionsOrdered.jsx";
import {ModalCreateQuestion} from "../../../../Components/Questions/ModalCreateQuestion.jsx";
import {ModalAddTester} from "../../../../Components/TestPlans/ModalAddTester.jsx";
import {CardTestPlanDeadline} from "../../../../Components/TestPlans/CardTestPlanDeadline.jsx";
import {useTestPlan, useUpdateTestPlan} from "../../../../Hooks/queries/useTestPlansQuery.js";
import {useRelease} from "../../../../Hooks/queries/useReleasesQuery.js";
import {usePlanHealth} from "../../../../Hooks/queries/useQuestionsQuery.js";
import {HealthDisplay} from "../../../../Components/Health/HealthDisplay.jsx";
import {HealthOverTimeLineChart} from "../../../../Components/Health/HealthOverTimeLineChart.jsx";

const capitalizeFirstLetter = (val) => String(val).charAt(0).toUpperCase() + String(val).slice(1);

const stateToImg = (state) => {
    if (state === 'published') return '/assets/testers.jpg';
    if (state === 'archived') return '/assets/sleep.jpg';
    return '/assets/draft.jpg';
};

export const Page = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const {currentProject} = useProjectStore();
    const [editMode, setEditMode] = useState(false);
    const [currentTab, setCurrentTab] = useState(undefined);
    const [modalState, setModalState] = useState(false);
    const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
    const [addTesterOpen, setAddTesterOpen] = useState(false);
    const isTeamTab = currentTab?.name === 'team';

    const {data: testPlanData, isError, isLoading} = useTestPlan(params.tid);
    const updateTestPlan = useUpdateTestPlan();
    const {
        isLoading: healthLoading,
        pass,
        passWithBugs,
        failed,
        blocked,
        pending,
        allAnswers
    } = usePlanHealth(testPlanData);

    const releaseIri = testPlanData?.release;
    const releaseId = typeof releaseIri === 'string'
        ? releaseIri.split('/').pop()
        : releaseIri?.id ?? undefined;
    const {data: parentRelease} = useRelease(releaseId);

    const truncatedName = (testPlanData?.name ?? '').length > 120
        ? testPlanData.name.slice(0, 120) + '…'
        : testPlanData?.name;

    const breadcrumbParents = [
        {label: currentProject?.name ?? 'Project', path: '/app/'},
        ...(parentRelease ? [{label: parentRelease.name, path: '/app/project/releases/' + parentRelease.id}] : []),
    ];

    if (!currentProject?.id) {
        navigate('/app/');
        return null;
    }

    if (isError) {
        return <Error404 goBackUrl="/app/project/releases"
                         message="Gator could not find this Release... Maybe try to look elsewhere."/>;
    }

    const changeState = (state) => {
        updateTestPlan.mutate({id: testPlanData.id, data: {state}});
    };

    return (
        <>
            <PageContentWrapper>
                <PageTitle
                    title={currentProject.name + " - " + t('Testing plan') + " " + (testPlanData?.name ?? '')}
                    breadcrumbParents={breadcrumbParents}
                    breadcrumbLabel={truncatedName}
                >
                    {isTeamTab ? (
                        <Button
                            icon="lni-user-add"
                            disabled={!testPlanData}
                            onClick={() => setAddTesterOpen(true)}
                            type="primary"
                            size="sm"
                        >
                            {t('Add tester')}
                        </Button>
                    ) : (
                        <Button
                            icon="lni-plus"
                            disabled={!testPlanData}
                            onClick={() => setCreateQuestionOpen(true)}
                            type="primary"
                            size="sm"
                        >
                            {t('New question')}
                        </Button>
                    )}
                </PageTitle>
                <PageElementWrapper>
                    <TabWrapper inUrlParams={true} onChange={(tab) => setCurrentTab(tab)} name="tab">
                        <Tab icon="lni-book-1" active={true} name="overview" title={t('Overview')}>
                            <Row className="flex-column-reverse flex-xl-row">
                                <Col sm={12} xl={8}>
                                    <Row>
                                        {testPlanData?.state && (
                                            <Col fullHeight={true} sm={12} md={6}>
                                                <Card>
                                                    <CardHeader
                                                        title={t('Status') + ' "' + t(capitalizeFirstLetter(testPlanData.state)) + '"'}/>
                                                    <CardBody>
                                                        <div
                                                            className="w-100 d-flex flex-column justify-content-center align-items-center">
                                                            <div style={{width: '200px', height: 'auto'}}
                                                                 className="d-flex justify-content-center align-items-center">
                                                                <img className="w-100"
                                                                     src={stateToImg(testPlanData.state)} alt="notif"/>
                                                            </div>
                                                            <div className="w-100">
                                                                <p>
                                                                    {t('This testing plan status is')}&nbsp;
                                                                    <strong>{t(capitalizeFirstLetter(testPlanData.state))}</strong>.
                                                                    <br/>
                                                                    {t(capitalizeFirstLetter(testPlanData.state) + ' description')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {testPlanData.state === 'draft' && (
                                                            <div className="w-100 mt-2">
                                                                <Button loading={updateTestPlan.isPending} size="sm"
                                                                        fullWidth
                                                                        onClick={() => changeState('published')}
                                                                        icon="lni-rocket-5" type="primary">
                                                                    {t('Set as Published')}
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {testPlanData.state === 'published' && (
                                                            <div className="w-100 mt-2">
                                                                <Button loading={updateTestPlan.isPending} size="sm"
                                                                        fullWidth
                                                                        onClick={() => changeState('archived')}
                                                                        icon="lni-box-closed" type="light">
                                                                    {t('Set as Archived')}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        )}
                                        <Col fullHeight={true} sm={12} md={6}>
                                            <Card className="h-100">
                                                <CardHeader
                                                    title={t('Plan Health')}/>
                                                <CardBody>
                                                    <div className="d-flex align-items-center h-100">
                                                        <HealthDisplay
                                                            pass={pass}
                                                            passWithBugs={passWithBugs}
                                                            failed={failed}
                                                            blocked={blocked}
                                                            pending={pending}
                                                            isLoading={healthLoading}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                        <Col fullHeight={true} sm={12}>
                                            <Card>
                                                <CardBody>
                                                    <HealthOverTimeLineChart answersStatItems={allAnswers}/>
                                                </CardBody>
                                            </Card>
                                        </Col>


                                        <Col>
                                            <Card>
                                                {editMode && !isLoading && testPlanData && (
                                                    <CardBody>
                                                        <EditTestPlanForm
                                                            testPlan={testPlanData}
                                                            onCancel={() => setEditMode(false)}
                                                            onUpdate={() => setEditMode(false)}
                                                        />
                                                    </CardBody>
                                                )}
                                                {!editMode && (
                                                    <>
                                                        <CardHeader title={testPlanData?.name}/>
                                                        <CardBody>
                                                            <div className="testing-plan-summary mb-3">
                                                                {testPlanData?.description}
                                                            </div>
                                                            {testPlanData?.content && (
                                                                <>
                                                                    <Separator text={t("Test Plan Introduction")}/>
                                                                    <div className="release-description">
                                                                        <ReleaseDescription
                                                                            description={testPlanData.content}/>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </CardBody>
                                                    </>
                                                )}
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={12} xl={4}>
                                    <Row>
                                        {testPlanData?.state && (testPlanData.state === 'published' || testPlanData.state === 'draft') && (
                                            <Col fullHeight={true} sm={12}>
                                                {testPlanData?.id && <CardTestPlanDeadline testPlan={testPlanData}/>}
                                            </Col>
                                        )}
                                        <Col>
                                            <Card>
                                                <CardHeader title={t("Manage this testing plan")}/>
                                                <CardGroup
                                                    className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex flex-column">
                                                        <div className="heading">{t('Edit')}</div>
                                                        <div
                                                            className="text-muted small">{t('Edit the testing plan details')}</div>
                                                    </div>
                                                    <Button onClick={() => setEditMode(!editMode)} iconOnly type="light"
                                                            size="sm">
                                                        <i className="font-icon lni lni-pencil-1"></i>
                                                    </Button>
                                                </CardGroup>
                                                <CardGroup
                                                    className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex flex-column">
                                                        <div className="heading">{t('Change Status')}</div>
                                                        <div
                                                            className="text-muted small">{t('Change Status of this testing plan')}</div>
                                                    </div>
                                                    <Button disabled={editMode} onClick={() => setModalState(true)}
                                                            iconOnly type="light" size="sm">
                                                        <i className="font-icon lni lni-flag-1"></i>
                                                    </Button>
                                                </CardGroup>
                                                <CardGroup
                                                    className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex flex-column" style={{opacity: .3}}>
                                                        <div className="heading">{t('Download')}</div>
                                                        <div
                                                            className="text-muted small">{t('Get the testing details in CSV')}</div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-sm">
                                                        <span className="badge bg-secondary">Upcoming</span>
                                                        <Button iconOnly type="light" size="sm" disabled>
                                                            <i className="font-icon lni lni-download-1"></i>
                                                        </Button>
                                                    </div>
                                                </CardGroup>
                                                <CardGroup
                                                    className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex flex-column">
                                                        <div className="heading text-danger">{t('Danger zone')}</div>
                                                        <div
                                                            className="text-muted small">{t('Delete this release and testings')}</div>
                                                    </div>
                                                    <Button iconOnly type="danger" size="sm">
                                                        <i className="font-icon lni lni-trash-3"></i>
                                                    </Button>
                                                </CardGroup>
                                            </Card>
                                        </Col>
                                        <Col>
                                            <Card>
                                                <CardHeader title={t('What is a testing plan?')}/>
                                                <CardBody>
                                                    <div
                                                        className="w-100 d-flex flex-column justify-content-between gap-md align-items-center">
                                                        <div className="d-block">
                                                            <Trans i18nKey='What is a testing plan description'>
                                                                <p>In <strong>TestGator</strong>, a <strong>testing
                                                                    plan</strong> is a series
                                                                    of <strong>questions</strong> that allow you to test
                                                                    a feature or a scenario. Testers follow these
                                                                    questions, give feedback, and ensure quality before
                                                                    deployment. Track progress, collect insights, and
                                                                    refine each version efficiently.</p>
                                                            </Trans>
                                                        </div>
                                                        <div className="d-flex x">
                                                            <img className="w-100" src="/assets/testers.jpg"
                                                                 alt="notif"/>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                                <CardFooter>
                                                    <Button icon="lni-link-2-angular-right" type="link" size="sm">View
                                                        Documentation</Button>
                                                </CardFooter>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab icon="lni-check-square-2" name="testing_plans" title={t('Questions')}
                             badge={testPlanData?.totalQuestions}>
                            <Row>
                                <Col>
                                    <div className="w-100">
                                        {testPlanData?.id && (
                                            <ListQuestionsOrdered testPlan={testPlanData}/>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab icon="lni-user-multiple-4" name="team" title={t('Team')}>
                            <Row>
                                <Col col={12}>
                                    <div style={AgGridDisplay.defaultWrapperStyle} className="w-100">
                                        {testPlanData?.id && currentTab?.name === 'team' && (
                                            <TestersListingInTestPlan testPlan={testPlanData}/>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Tab>
                    </TabWrapper>
                </PageElementWrapper>
            </PageContentWrapper>
            <ModalChangeTestPlanState
                testPlan={testPlanData}
                onCancel={() => setModalState(false)}
                isVisible={modalState}
                onConfirm={() => setModalState(false)}
            />
            <ModalCreateQuestion
                isVisible={createQuestionOpen}
                testPlan={testPlanData}
                onCancel={() => setCreateQuestionOpen(false)}
            />
            <ModalAddTester
                isVisible={addTesterOpen}
                testPlan={testPlanData}
                onCancel={() => setAddTesterOpen(false)}
                onSuccess={() => setAddTesterOpen(false)}
            />
        </>
    );
};
