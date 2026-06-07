import {useNavigate, useParams, Link, useSearchParams} from "react-router";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useDebounce} from "../../../../Hooks/useDebounce.js";
import {useAnswers} from "../../../../Hooks/queries/useAnswersQuery.js";
import {useQuestion, useQuestionStats, useUpdateQuestion} from "../../../../Hooks/queries/useQuestionsQuery.js";
import {useTestPlan} from "../../../../Hooks/queries/useTestPlansQuery.js";
import {useRelease} from "../../../../Hooks/queries/useReleasesQuery.js";
import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {CardGroup} from "../../../../Components/UI/Card/CardGroup.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {Tab} from "../../../../Components/UI/Tabs/Tab.jsx";
import {TabWrapper} from "../../../../Components/UI/Tabs/TabWrapper.jsx";
import {Error404} from "../../../../Components/UI/Error404.jsx";
import {TextInput} from "../../../../Components/UI/Form/Inputs/TextInput.jsx";
import {FormGroup} from "../../../../Components/UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../../../../Components/UI/Form/FormGroupLabel.jsx";
import {MkEditorInstance} from "../../../../Components/UI/Form/Editor/MkEditorInstance.jsx";
import {ReleaseDescription} from "../../../../Components/Releases/ReleaseDescription.jsx";
import {HealthDisplay, HEALTH_COLORS} from "../../../../Components/Health/HealthDisplay.jsx";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {HealthOverTimeLineChart} from "../../../../Components/Health/HealthOverTimeLineChart.jsx";
import {AnswerCardPreview} from "../../../../Components/Answers/AnswerCardPreview.jsx";
import {Pagination} from "../../../../Components/UI/Pagination/Pagination.jsx";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({icon, iconColor, label, value, sub}) => (
    <div className="answer-stat-card d-flex align-items-center gap-md p-3">
        <div className="answer-stat-icon flex-shrink-0" style={{background: iconColor + '22', color: iconColor}}>
            <i className={`font-icon lni lni-${icon}`}/>
        </div>
        <div className="d-flex flex-column">
            <span className="answer-stat-label text-muted small">{label}</span>
            <span className="answer-stat-value fw-bold">{value}</span>
            <span className="answer-stat-sub text-muted" style={{fontSize: '.75rem'}}>{sub}</span>
        </div>
    </div>
);

// ── Answer state badge ────────────────────────────────────────────────────────
const STATE_LABELS = {
    pass: 'Passed',
    pass_with_bugs: 'Passed with bugs',
    failed: 'Failed',
    blocked: 'Blocked',
    pending: 'Pending',
};

const STATE_COLOR_KEY = {
    pass: 'pass',
    pass_with_bugs: 'passWithBugs',
    failed: 'failed',
    blocked: 'blocked',
    pending: 'pending',
};

const AnswerStateBadge = ({state}) => {
    const color = HEALTH_COLORS[STATE_COLOR_KEY[state]] ?? '#d1d5db';
    return (
        <span className="badge heading" style={{backgroundColor: color, color: '#fff'}}>
            {STATE_LABELS[state] ?? state}
        </span>
    );
};

// ── Answer card ───────────────────────────────────────────────────────────────
const AnswerCard = ({answer}) => {
    const date = answer.date
        ? new Date(answer.date).toLocaleDateString(undefined, {day: '2-digit', month: 'short', year: 'numeric'})
        : null;

    return (
        <div className="answer-card d-flex flex-column gap-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-sm">
                    <AnswerStateBadge state={answer.state}/>
                    {answer.author && <span className="small fw-semibold">{answer.author}</span>}
                </div>
                {date && <span className="text-muted small">{date}</span>}
            </div>
            {answer.comment && <p className="m-0 small text-muted">{answer.comment}</p>}
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export const Page = () => {
    const {t} = useTranslation();
    const {qid} = useParams();
    const navigate = useNavigate();
    const {currentProject} = useProjectStore();

    const {data: question, isError, isLoading} = useQuestion(qid);
    const {data: stats, isLoading: statsLoading} = useQuestionStats(qid);
    const updateQuestion = useUpdateQuestion();

    // Resolve parent test plan + release for breadcrumb
    const planIri = question?.plan; // e.g. "/api/test_plans/12"
    const planId = planIri ? planIri.split('/').pop() : undefined;
    const {data: parentPlan} = useTestPlan(planId);

    const releaseIri = parentPlan?.release;
    const releaseId = typeof releaseIri === 'string'
        ? releaseIri.split('/').pop()
        : releaseIri?.id ?? undefined;
    const {data: parentRelease} = useRelease(releaseId);

    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(undefined);
    const [content, setContent] = useState(undefined);

    const [searchParams, setSearchParams] = useSearchParams();

    const answerPage = parseInt(searchParams.get('page') ?? '1', 10);
    const answerFilter = searchParams.get('state') ?? null;
    const answerSearch = searchParams.get('query') ?? '';
    const answerSort = searchParams.get('sort') ?? 'newest';

    const setParam = (key, value, resetPage = false) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === null || value === '' || value === undefined) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            if (resetPage) next.delete('page');
            return next;
        }, {replace: false});
    };

    const setAnswerPage = (p) => setParam('page', p === 1 ? null : p);
    const setAnswerFilter = (f) => setParam('state', f, true);
    const setAnswerSearch = (q) => setParam('query', q, true);
    const setAnswerSort = (s) => setParam('sort', s === 'newest' ? null : s, true);

    const debouncedSearch = useDebounce(answerSearch, 500);
    const ANSWERS_PER_PAGE = 10;

    const SORT_OPTIONS = [
        {value: 'newest', label: t('Newest'), order: {created: 'desc'}},
        {value: 'oldest', label: t('Oldest'), order: {created: 'asc'}},
        {value: 'state_asc', label: t('State (A-Z)'), order: {state: 'asc'}},
        {value: 'state_desc', label: t('State (Z-A)'), order: {state: 'desc'}},
    ];
    const currentSort = SORT_OPTIONS.find(o => o.value === answerSort) ?? SORT_OPTIONS[0];

    const {data: answersData, isLoading: answersLoading} = useAnswers({
        question: qid,
        page: answerPage,
        itemsPerPage: ANSWERS_PER_PAGE,
        order: currentSort.order,
        ...(answerFilter ? {state: answerFilter} : {}),
        ...(debouncedSearch ? {query: debouncedSearch} : {}),
    });

    const hasActiveFilters = answerFilter !== null || answerSearch !== '' || answerSort !== 'newest';
    const clearFilters = () => setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('state');
        next.delete('query');
        next.delete('sort');
        next.delete('page');
        return next;
    }, {replace: false});

    if (!currentProject?.id) {
        navigate('/app/');
        return null;
    }

    if (isError) {
        return <Error404 goBackUrl="/app/project/testing_plans" message="Question not found."/>;
    }

    const currentName = name ?? question?.name ?? '';
    const currentContent = content ?? question?.content ?? '';
    const answers = stats?.answers ?? [];

    const truncatedName = currentName.length > 120
        ? currentName.slice(0, 120) + '…'
        : currentName;

    const breadcrumbParents = [
        {label: currentProject?.name ?? 'Project', path: '/app/'},
        ...(parentRelease ? [{label: parentRelease.name, path: '/app/project/releases/' + parentRelease.id}] : []),
        ...(parentPlan ? [{label: parentPlan.name, path: '/app/project/testing_plans/' + parentPlan.id}] : []),
    ];

    const handleSave = () => {
        updateQuestion.mutate(
            {id: qid, data: {name: currentName, content: currentContent}},
            {
                onSuccess: () => {
                    setName(undefined);
                    setContent(undefined);
                    setEditMode(false);
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setName(undefined);
        setContent(undefined);
        setEditMode(false);
    };

    return (
        <PageContentWrapper>
            <PageTitle
                title={(currentProject?.name ?? '') + ' — ' + (question?.name ?? '')}
                breadcrumbParents={breadcrumbParents}
                breadcrumbLabel={truncatedName || undefined}
            />

            <PageElementWrapper>
                <TabWrapper name="tab" inUrlParams={true}>

                    {/* ── General ─────────────────────────────────── */}
                    <Tab icon="lni-book-1" name="general" title={t('General')} active={true}>
                        <Row className="flex-column-reverse flex-xl-row">

                            {/* Left — content */}
                            <Col sm={12} xl={8}>
                                <Row>
                                    <Col>
                                        <Card>
                                            <CardBody>
                                                <HealthOverTimeLineChart answersStatItems={stats?.answers ?? []}/>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col>
                                        <Card>
                                            {editMode && !isLoading && question && (
                                                <CardBody>
                                                    <FormGroup>
                                                        <FormGroupLabel>{t('Question name')}</FormGroupLabel>
                                                        <TextInput
                                                            value={currentName}
                                                            onChange={v => setName(v)}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <FormGroupLabel>{t('Question Content')}</FormGroupLabel>
                                                        <MkEditorInstance
                                                            value={currentContent}
                                                            onChange={v => setContent(v)}
                                                        />
                                                    </FormGroup>
                                                    <div className="d-flex gap-sm justify-content-end mt-2">
                                                        <Button type="light" size="sm" onClick={handleCancelEdit}>
                                                            {t('Cancel')}
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            size="sm"
                                                            icon="lni-download-1"
                                                            loading={updateQuestion.isPending}
                                                            onClick={handleSave}
                                                        >
                                                            {t('Save changes')}
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            )}
                                            {!editMode && (
                                                <>
                                                    <CardHeader title={question?.name ?? ''}/>
                                                    <CardBody>
                                                        <div className="release-description">
                                                            <ReleaseDescription description={question?.content}/>
                                                        </div>
                                                    </CardBody>
                                                </>
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>

                            {/* Right — health + management */}
                            <Col sm={12} xl={4}>
                                <Row>
                                    <Col>
                                        <Card>
                                            <CardHeader title={t('Question Health')}/>
                                            <CardBody>
                                                <HealthDisplay
                                                    pass={stats?.test_pass ?? 0}
                                                    passWithBugs={stats?.test_pass_with_bugs ?? 0}
                                                    failed={stats?.test_failed ?? 0}
                                                    blocked={stats?.test_blocked ?? 0}
                                                    pending={stats?.test_pending ?? 0}
                                                    isLoading={statsLoading}
                                                />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col>
                                        <Card>
                                            <CardHeader title={t('Manage this question')}/>
                                            <CardGroup className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex flex-column">
                                                    <div className="heading">{t('Edit')}</div>
                                                    <div
                                                        className="text-muted small">{t('Edit the question details')}</div>
                                                </div>
                                                <Button
                                                    onClick={() => setEditMode(!editMode)}
                                                    iconOnly type="light" size="sm"
                                                >
                                                    <i className="font-icon lni lni-pencil-1"/>
                                                </Button>
                                            </CardGroup>
                                            <CardGroup className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex flex-column">
                                                    <div className="heading">{t('Export')}</div>
                                                    <div
                                                        className="text-muted small">{t('Download question as CSV')}</div>
                                                </div>
                                                <Button iconOnly type="light" size="sm">
                                                    <i className="font-icon lni lni-download-1"/>
                                                </Button>
                                            </CardGroup>
                                            <CardGroup className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex flex-column">
                                                    <div className="heading text-danger">{t('Danger zone')}</div>
                                                    <div className="text-muted small">{t('Delete this question')}</div>
                                                </div>
                                                <Button iconOnly type="danger" size="sm">
                                                    <i className="font-icon lni lni-trash-3"/>
                                                </Button>
                                            </CardGroup>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Tab>

                    {/* ── Answers ─────────────────────────────────── */}
                    <Tab
                        icon="lni-comment-2"
                        name="answers"
                        title={t('Answers')}
                        badge={stats?.test_all_count}
                    >
                        {/* Stat cards row */}
                        <Row className="mb-2">
                            {[
                                {
                                    icon: 'comment-1',
                                    iconColor: '#69BC9E',
                                    label: t('Total answers'),
                                    value: stats?.test_all_count ?? 0,
                                    sub: '100% ' + t('of answers'),
                                },
                                {
                                    icon: 'check-circle-1',
                                    iconColor: HEALTH_COLORS.pass,
                                    label: t('Passed'),
                                    value: (stats?.test_pass ?? 0) + (stats?.test_pass_with_bugs ?? 0),
                                    sub: (stats?.test_all_count
                                        ? Math.round(((stats.test_pass + stats.test_pass_with_bugs) / stats.test_all_count) * 100)
                                        : 0) + '% ' + t('of answers'),
                                },
                                {
                                    icon: 'locked-1',
                                    iconColor: HEALTH_COLORS.blocked,
                                    label: t('Blocked'),
                                    value: stats?.test_blocked ?? 0,
                                    sub: (stats?.test_all_count
                                        ? Math.round((stats.test_blocked / stats.test_all_count) * 100)
                                        : 0) + '% ' + t('of answers'),
                                },
                                {
                                    icon: 'hourglass',
                                    iconColor: HEALTH_COLORS.pending,
                                    label: t('Pending'),
                                    value: stats?.test_pending ?? 0,
                                    sub: (stats?.test_all_count
                                        ? Math.round((stats.test_pending / stats.test_all_count) * 100)
                                        : 0) + '% ' + t('of answers'),
                                },
                            ].map((card, i) => (
                                <Col key={i} sm={12} md={6} xl={3}>
                                    <Card>
                                        <StatCard {...card}/>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Answer list + filter */}
                        {(() => {
                            const filters = [
                                {key: null, label: t('All answers'), count: stats?.test_all_count ?? 0, color: null},
                                {
                                    key: 'pass',
                                    label: t('Pass'),
                                    count: stats?.test_pass ?? 0,
                                    color: HEALTH_COLORS.pass
                                },
                                {
                                    key: 'pass_with_bugs',
                                    label: t('Pass with bug'),
                                    count: stats?.test_pass_with_bugs ?? 0,
                                    color: HEALTH_COLORS.passWithBugs
                                },
                                {
                                    key: 'blocked',
                                    label: t('Blocked'),
                                    count: stats?.test_blocked ?? 0,
                                    color: HEALTH_COLORS.blocked
                                },
                                {
                                    key: 'failed',
                                    label: t('Failed'),
                                    count: stats?.test_failed ?? 0,
                                    color: HEALTH_COLORS.failed
                                },
                            ];

                            const items = answersData?.member ?? [];
                            const total = answersData?.totalItems ?? 0;
                            const totalPages = Math.ceil(total / ANSWERS_PER_PAGE);
                            const start = total === 0 ? 0 : (answerPage - 1) * ANSWERS_PER_PAGE + 1;
                            const end = Math.min(answerPage * ANSWERS_PER_PAGE, total);

                            return (
                                <Row>
                                    <Col>
                                        <Card>
                                            <CardBody>
                                                {/* Filter bar */}
                                                <div className="answer-filter-bar">
                                                    <div className="answer-filter-pills">
                                                        {filters.map(f => {
                                                            const active = answerFilter === f.key;
                                                            return (
                                                                <button
                                                                    key={String(f.key)}
                                                                    className={`afb-pill${active ? ' afb-pill-active' : ''}`}
                                                                    style={f.color ? {'--afb-color': f.color} : {}}
                                                                    onClick={() => setAnswerFilter(f.key)}
                                                                >
                                                                    {f.color && <span className="afb-dot"
                                                                                      style={{background: f.color}}/>}
                                                                    <span className="afb-label">{f.label}</span>
                                                                    <span className="afb-count">{f.count}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="afb-search">
                                                        <FormGroup className="mb-0">
                                                            <TextInput
                                                                placeholder={t('Search answers...')}
                                                                value={answerSearch}
                                                                onChange={v => setAnswerSearch(v)}
                                                                leftIcon="lni-search-1"
                                                                clearable
                                                            />
                                                        </FormGroup>
                                                    </div>
                                                </div>

                                                {/* Sort / clear toolbar */}
                                                <div className="answer-toolbar">
                                                    <Button
                                                        type="light"
                                                        size="sm"
                                                        icon="lni-rotate-270"
                                                        disabled={!hasActiveFilters}
                                                        onClick={clearFilters}
                                                    >
                                                        {t('Clear filters')}
                                                    </Button>
                                                    <div className="atb-sort">
                                                        <span className="atb-sort-label">{t('Sort by')}:</span>
                                                        <div className="atb-select-wrap btn btn-light btn-sm">
                                                            <select
                                                                className="atb-select"
                                                                value={answerSort}
                                                                onChange={e => setAnswerSort(e.target.value)}
                                                            >
                                                                {SORT_OPTIONS.map(o => (
                                                                    <option key={o.value}
                                                                            value={o.value}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                            <i className="font-icon lni lni-chevron-down atb-select-caret"/>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* List */}
                                                {!answersLoading && items.length === 0 && (
                                                    <p className="text-muted text-center m-0">{t('No answers yet.')}</p>
                                                )}
                                                <div className="d-flex flex-column answer-list">
                                                    {items.map(answer => (
                                                        <Link
                                                            key={answer.id}
                                                            to={`/app/project/answers/${answer.id}`}
                                                            style={{textDecoration: 'none', color: 'inherit'}}
                                                        >
                                                            <Card
                                                                interractive={true}
                                                                className="mb-2 shadow-none cursor-pointer"
                                                            >
                                                                <AnswerCardPreview answerData={answer}/>
                                                            </Card>
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {total > 0 && (
                                                    <div
                                                        className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                                        <span className="text-muted small">
                                                            {start}–{end} {t('of')} {total}
                                                        </span>
                                                        <Pagination
                                                            page={answerPage}
                                                            totalPages={totalPages}
                                                            onChange={setAnswerPage}
                                                        />
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            );
                        })()}
                    </Tab>

                </TabWrapper>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
