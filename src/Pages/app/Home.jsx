import {Link, NavLink} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import {useProjects, useProjectStats} from "../../Hooks/queries/useProjectsQuery.js";
import {useTestPlansPage} from "../../Hooks/queries/useTestPlansQuery.js";
import {usePlanHealth, questionKeys} from "../../Hooks/queries/useQuestionsQuery.js";
import {HEALTH_COLORS} from "../../Components/Health/HealthDisplay.jsx";
import {useRecentProjectAnswers} from "../../Hooks/queries/useAnswersQuery.js";
import {useQueries} from "@tanstack/react-query";
import QuestionsService from "../../Services/PrivateApi/QuestionsService.js";
import {testerKeys} from "../../Hooks/queries/useTestersQuery.js";
import TestersService from "../../Services/PrivateApi/TestersService.js";
import {testPlanKeys} from "../../Hooks/queries/useTestPlansQuery.js";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {releaseKeys} from "../../Hooks/queries/useReleasesQuery.js";
import ReleasesService from "../../Services/PrivateApi/ReleasesService.js";

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

// ── Recent Activity ───────────────────────────────────────────────────────────

const ANSWER_STATE_ICONS = {
    pass: 'lni-check-circle-1',
    pass_with_bugs: 'lni-check-circle-1',
    failed: 'lni-xmark-circle',
    blocked: 'lni-locked-1',
    pending: 'lni-hourglass',
};

const ANSWER_STATE_LABELS = {
    pass: 'Passed',
    pass_with_bugs: 'Passed with bugs',
    failed: 'Failed',
    blocked: 'Blocked',
    pending: 'Pending',
};

const colorKey = (state) => state === 'pass_with_bugs' ? 'passWithBugs' : state;

const relativeTime = (iso) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const ActivityRow = ({answer, questionName, testerEmail, planName, releaseName}) => {
    const state = answer.state ?? 'pending';
    const color = HEALTH_COLORS[colorKey(state)] ?? HEALTH_COLORS.pending;
    const icon = ANSWER_STATE_ICONS[state] ?? 'lni-hourglass';
    const label = ANSWER_STATE_LABELS[state] ?? state;
    const name = questionName ?? '…';
    const context = [planName, releaseName].filter(Boolean).join(' — ');

    return (
        <Link to={`/app/project/answers/${answer.id}`} className="activity-row">
            <div className="activity-icon" style={{color, background: color + '18'}}>
                <i className={`font-icon lni ${icon}`}/>
            </div>
            <div className="activity-info">
                {context && <span className="activity-context">{context}</span>}
                <span className="activity-title">
                    <em>"{name}"</em> — {label}
                </span>
                {answer.author && (
                    <span className="activity-author">{answer.author}</span>
                )}
                {testerEmail && (
                    <span className="activity-email">{testerEmail}</span>
                )}
            </div>
            {answer.created && (
                <span className="activity-time">{relativeTime(answer.created)}</span>
            )}
        </Link>
    );
};

const RecentActivityCard = ({projectId}) => {
    const {data, isLoading} = useRecentProjectAnswers(projectId);
    const answers = data?.member ?? [];

    // Batch-load question names
    const questionIds = answers.map(a =>
        typeof a.question === 'string' ? a.question.split('/').pop() : null
    ).filter(Boolean);

    const questionResults = useQueries({
        queries: questionIds.map(id => ({
            queryKey: questionKeys.detail(id),
            queryFn: () => QuestionsService.getOne(id).then(r => r.data),
            enabled: !!id,
        })),
    });

    const questionMap = {};
    questionIds.forEach((id, i) => {
        if (questionResults[i]?.data) {
            questionMap[`/api/questions/${id}`] = questionResults[i].data.name;
        }
    });

    // Batch-load tester emails
    const testerIds = answers.map(a =>
        typeof a.tester === 'string' ? a.tester.split('/').pop() : null
    ).filter(Boolean);

    const testerResults = useQueries({
        queries: testerIds.map(id => ({
            queryKey: testerKeys.detail(id),
            queryFn: () => TestersService.getTester(id).then(r => r.data),
            enabled: !!id,
        })),
    });

    const testerMap = {};
    testerIds.forEach((id, i) => {
        if (testerResults[i]?.data) {
            testerMap[`/api/testers/${id}`] = testerResults[i].data.email;
        }
    });

    // Batch-load test plan names (via question.plan)
    const planIris = [...new Set(
        Object.values(questionMap).length > 0
            ? answers.map(a => {
                const q = questionResults[questionIds.indexOf(
                    typeof a.question === 'string' ? a.question.split('/').pop() : null
                )]?.data;
                return q?.plan ?? null;
            }).filter(Boolean)
            : []
    )];
    const planIds = planIris.map(iri => iri.split('/').pop());

    const planResults = useQueries({
        queries: planIds.map(id => ({
            queryKey: testPlanKeys.detail(id),
            queryFn: () => TestPlansService.getOne(id).then(r => r.data),
            enabled: !!id,
        })),
    });

    const planMap = {};   // IRI → {name, releaseIri}
    planIds.forEach((id, i) => {
        if (planResults[i]?.data) {
            planMap[`/api/test_plans/${id}`] = planResults[i].data;
        }
    });

    // Batch-load release names (via testPlan.release)
    const releaseIris = [...new Set(
        Object.values(planMap).map(p => (typeof p.release === 'string' ? p.release : null)).filter(Boolean)
    )];
    const releaseIds = releaseIris.map(iri => iri.split('/').pop());

    const releaseResults = useQueries({
        queries: releaseIds.map(id => ({
            queryKey: releaseKeys.detail(id),
            queryFn: () => ReleasesService.getRelease(id).then(r => r.data),
            enabled: !!id,
        })),
    });

    const releaseMap = {};
    releaseIds.forEach((id, i) => {
        if (releaseResults[i]?.data) {
            releaseMap[`/api/releases/${id}`] = releaseResults[i].data.name;
        }
    });

    return (
        <Card>
            <CardHeader title="Recent activity"/>
            <CardBody>
                {isLoading && <Loader/>}
                {!isLoading && answers.length === 0 && (
                    <span className="text-muted small">No activity yet.</span>
                )}
                {answers.map(answer => {
                    const qIri = answer.question;
                    const qId = typeof qIri === 'string' ? qIri.split('/').pop() : null;
                    const qData = questionResults[questionIds.indexOf(qId)]?.data;
                    const plan = qData?.plan ? planMap[qData.plan] : null;
                    const releaseIri = plan?.release ?? null;

                    return (
                        <ActivityRow
                            key={answer.id}
                            answer={answer}
                            questionName={questionMap[qIri] ?? null}
                            testerEmail={testerMap[answer.tester] ?? null}
                            planName={plan?.name ?? null}
                            releaseName={releaseIri ? (releaseMap[releaseIri] ?? null) : null}
                        />
                    );
                })}
            </CardBody>
        </Card>
    );
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

    const {data: projectStats} = useProjectStats(currentProject?.id);

    return (
        <PageContentWrapper>
            <PageTitle title="TestGator Dashboard"/>
            <PageElementWrapper>
                {/* ── Stats row ── */}
                <Row className="mb-3">
                    {[
                        {label: 'Releases', value: projectStats?.releases ?? '—'},
                        {label: 'Testing Plans', value: projectStats?.testPlans ?? '—'},
                        {label: 'Testers', value: projectStats?.testers ?? '—'},
                        {label: 'Tests realised', value: projectStats?.answers ?? '—'},
                    ].map(({label, value}) => (
                        <Col key={label} sm={6} xl={3}>
                            <Card>
                                <CardBody>
                                    <div className="dash-stat-card">
                                        <div className="dash-stat-label">{label}</div>
                                        <div className="dash-stat-value">{value}</div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
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
                            <Col size={12}>
                                <RecentActivityCard projectId={currentProject?.id}/>
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
                                    <CardHeader title={currentProject?.name ?? 'About this project'}/>
                                    <CardBody>
                                        <div className="markdown-renderer">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {currentProject?.description ?? ''}
                                            </ReactMarkdown>
                                        </div>
                                    </CardBody>
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
