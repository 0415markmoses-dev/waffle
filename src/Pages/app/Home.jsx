import {Link, NavLink} from "react-router-dom";
import {PageContentWrapper} from "../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../Components/Navigation/PageElementWrapper.jsx";
import {Button} from "../../Components/UI/Buttons/Button.jsx";
import {Row} from "../../Components/UI/Grid/Row.jsx";
import {Col} from "../../Components/UI/Grid/Col.jsx";
import {Card} from "../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../Components/UI/Card/CardBody.jsx";
import {CardHeader} from "../../Components/UI/Card/CardHeader.jsx";
import {CardFooter} from "../../Components/UI/Card/CardFooter.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {SingleMetricDisplay} from "../../Components/UI/Metrics/SingleMetricDisplay.jsx";
import {MetricVerticalSeparator} from "../../Components/UI/Metrics/MetricVerticalSeparator.jsx";
import {ErrorState} from "../../Components/UI/ErrorState.jsx";
import {Loader} from "../../Components/UI/Loader.jsx";
import {useProjects} from "../../Hooks/queries/useProjectsQuery.js";
import {useTestPlansPage} from "../../Hooks/queries/useTestPlansQuery.js";
import {usePlanHealth} from "../../Hooks/queries/useQuestionsQuery.js";
import {HEALTH_COLORS} from "../../Components/Health/HealthDisplay.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

const dominantColor = ({pass, passWithBugs, failed, blocked, pending}) => {
    const nonPending = {pass, passWithBugs, failed, blocked};
    const hasNonPending = Object.values(nonPending).some(v => v > 0);
    const pool = hasNonPending ? nonPending : {pending};
    const top = Object.entries(pool).reduce((a, b) => b[1] > a[1] ? b : a, ['pending', -1]);
    return HEALTH_COLORS[top[0]] ?? HEALTH_COLORS.pending;
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

// ── LatestPlanRow ─────────────────────────────────────────────────────────────

const LatestPlanRow = ({testPlan}) => {
    const health = usePlanHealth(testPlan);
    const color = dominantColor(health);
    const planId = typeof testPlan.id === 'string'
        ? testPlan.id.split('/').pop()
        : testPlan.id;

    return (
        <Link to={`/app/project/testing_plans/${planId}`} className="ltp-row">
            {/* Heart / health color indicator */}
            <div className="ltp-heart" style={{color}}>♥</div>

            {/* Name + release */}
            <div className="ltp-info">
                <span className="ltp-name">{testPlan.name}</span>
                {testPlan.release?.name && (
                    <span className="ltp-release text-muted">{testPlan.release.name}</span>
                )}
            </div>

            {/* Badges */}
            <div className="ltp-meta">
                <span className="ltp-badge">
                    <i className="font-icon lni lni-check-square-2"/>
                    {testPlan.totalQuestions ?? 0}
                </span>
                {testPlan.dueDate && (
                    <span className="ltp-badge">
                        <i className="font-icon lni lni-calendar-days"/>
                        {formatDate(testPlan.dueDate)}
                    </span>
                )}
            </div>
        </Link>
    );
};

// ── Home ──────────────────────────────────────────────────────────────────────

export const Home = () => {
    const {currentProject} = useProjectStore();

    const {data: projectsData} = useProjects();
    const projects = projectsData?.member ?? [];

    const {data: testPlans = [], isLoading: loadingTestPlans} = useTestPlansPage({
        'order[created]': 'desc',
        'release.project': currentProject?.id,
        itemsPerPage: 5,
        page: 1,
    });

    const otherProjects = currentProject?.id
        ? projects.filter(p => p.id !== currentProject.id)
        : projects;

    return (
        <PageContentWrapper>
            <PageTitle title="TestGator Dashboard">
                <Button type="light" size="sm">Edit project</Button>
                <Button icon="lni-plus" type="primary" size="sm">New release</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        {currentProject && (
                                            <div
                                                className="w-100 d-flex flex-row gap-lg align-items-center justify-content-around position-relative">
                                                <SingleMetricDisplay
                                                    label={currentProject.totalReleases > 1 ? 'Releases' : 'Release'}
                                                    value={currentProject.totalReleases}
                                                />
                                                <MetricVerticalSeparator/>
                                                <SingleMetricDisplay
                                                    label={currentProject.totalTesters > 1 ? 'Testers' : 'Tester'}
                                                    value={currentProject.totalTesters}
                                                />
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <CardHeader title="About"/>
                                    <CardBody>
                                        {currentProject && (
                                            <div className="w-100 d-flex flex-column gap-lg">
                                                <div className="d-flex justify-content-center align-items-center">
                                                    <div className="project-picture-wrapper size-lg">
                                                        <img src="/assets/gator_avatar.png" alt=""/>
                                                    </div>
                                                </div>
                                                <div className="w-100 d-flex flex-column gap-sm">
                                                    <p className="m-0">{currentProject.description}</p>
                                                    <ul className="list-unstyled m-0">
                                                        <li>
                                                            <b>Latest release: </b>
                                                            {currentProject.latestRelease ? (
                                                                <NavLink
                                                                    to={`/app/project/releases/${currentProject.latestRelease.id}`}>
                                                                    {currentProject.latestRelease.name}
                                                                </NavLink>
                                                            ) : 'No release yet'}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <CardHeader title="Other projects"/>
                                    <CardBody>
                                        <div className="d-flex flex-column gap-lg">
                                            {otherProjects.map((project, index) => (
                                                <div className="d-flex gap-md" key={index}>
                                                    <div
                                                        className="project-meta flex-grow-0 d-flex justify-content-end align-items-center">
                                                        <div className="project-picture-wrapper size-sm">
                                                            <img src="/assets/gator_avatar.png" alt=""/>
                                                        </div>
                                                    </div>
                                                    <div className="project-content d-flex flex-column gap-sm">
                                                        <a className="m-0" href="#">
                                                            <b>#{project.id} - {project.name}</b>
                                                        </a>
                                                        <p className="m-0 small">{project.description}</p>
                                                        <div className="w-100 m-0 d-flex gap-sm">
                                                            <div className="badge bg-info heading super-small">
                                                                {project.totalReleases} {project.totalReleases > 1 ? 'Releases' : 'Release'}
                                                            </div>
                                                            <div
                                                                className="badge bg-light text-muted heading super-small">
                                                                {project.totalTesters} {project.totalTesters > 1 ? 'Testers' : 'Tester'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={12} xl={8}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        <div className="w-100 d-flex justify-content-between gap-md align-items-center">
                                            <div className="d-flex flex-column">
                                                <h2>Unlock productivity with TestGator workflow</h2>
                                                <p>
                                                    Welcome to TestGator! Track testing progress, manage participants,
                                                    and analyze results effortlessly. Gain insights from real user
                                                    environments to streamline your software testing process.
                                                </p>
                                            </div>
                                            <div className="d-flex x">
                                                <img className="w-100" src="/assets/getting_started.jpg" alt="notif"/>
                                            </div>
                                        </div>
                                    </CardBody>
                                    <CardFooter>
                                        <Button icon="lni-link-2-angular-right" type="link" size="sm">
                                            View Documentation
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Col>
                            <Col size={12}>
                                <Card>
                                    <CardHeader title="Latest testing plans">
                                        <Button type="link" size="sm">View All</Button>
                                    </CardHeader>
                                    <CardBody>
                                        {loadingTestPlans && <Loader/>}
                                        {!loadingTestPlans && testPlans.length === 0 && (
                                            <ErrorState message="No testing plans found for this project"/>
                                        )}
                                        {testPlans.map(plan => (
                                            <LatestPlanRow key={plan.id} testPlan={plan}/>
                                        ))}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
