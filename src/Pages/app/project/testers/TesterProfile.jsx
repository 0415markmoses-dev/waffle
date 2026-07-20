import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useQuery} from '@tanstack/react-query';
import {useProjectStore} from '../../../../Store/PrivateData/ProjectsStore.js';
import {useTester, useUpdateTester, useDeleteTester} from '../../../../Hooks/queries/useTestersQuery.js';
import {useAssignedTestPlans, useUpdateTestPlan} from '../../../../Hooks/queries/useTestPlansQuery.js';
import TestPlansService from '../../../../Services/PrivateApi/TestPlansService.js';
import {useDebounce} from '../../../../Hooks/useDebounce.js';
import {useAnswersByTester} from '../../../../Hooks/queries/useAnswersQuery.js';
import {TesterAnnotations} from '../../../../Components/Testers/TesterAnnotations.jsx';
import {TesterTagEditor} from '../../../../Components/Testers/TesterTagEditor.jsx';
import {PageContentWrapper} from '../../../../Components/Navigation/PageContentWrapper.jsx';
import {PageTitle} from '../../../../Components/Navigation/PageTitle.jsx';
import {PageElementWrapper} from '../../../../Components/Navigation/PageElementWrapper.jsx';
import {Row} from '../../../../Components/UI/Grid/Row.jsx';
import {Col} from '../../../../Components/UI/Grid/Col.jsx';
import {Button} from '../../../../Components/UI/Buttons/Button.jsx';
import {ConfirmModal} from '../../../../Components/UI/ConfirmModal.jsx';
import {Card} from '../../../../Components/UI/Card/Card.jsx';
import {CardBody} from '../../../../Components/UI/Card/CardBody.jsx';
import {CardHeader} from '../../../../Components/UI/Card/CardHeader.jsx';
import {TabWrapper} from '../../../../Components/UI/Tabs/TabWrapper.jsx';
import {Tab} from '../../../../Components/UI/Tabs/Tab.jsx';
import {Pagination} from '../../../../Components/UI/Pagination/Pagination.jsx';
import {HEALTH_COLORS} from '../../../../Components/Health/HealthDisplay.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

const initials = (email = '') => {
    const local = email.split('@')[0] ?? '';
    const parts = local.split(/[._-]/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

const relativeTime = (iso) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
};

// ── State config ──────────────────────────────────────────────────────────────

const PLAN_STATE_CONFIG = {
    published: {
        icon: 'lni-play',
        iconBg: '#10b98120',
        iconColor: '#10b981',
        badgeClass: 'tp-plan-badge--published',
        label: 'Active'
    },
    draft: {
        icon: 'lni-pencil-1',
        iconBg: '#6b728020',
        iconColor: '#6b7280',
        badgeClass: 'tp-plan-badge--draft',
        label: 'Draft'
    },
    archived: {
        icon: 'lni-box-archive-1',
        iconBg: '#64748b20',
        iconColor: '#64748b',
        badgeClass: 'tp-plan-badge--archived',
        label: 'Archived'
    },
};

const ANSWER_STATE_CONFIG = {
    pass: {color: HEALTH_COLORS.pass, icon: 'lni-check-circle-1', label: 'Pass'},
    pass_with_bugs: {color: HEALTH_COLORS.passWithBugs, icon: 'lni-check-circle-1', label: 'Pass w/ bugs'},
    failed: {color: HEALTH_COLORS.failed, icon: 'lni-xmark-circle', label: 'Failed'},
    blocked: {color: HEALTH_COLORS.blocked ?? '#f59e0b', icon: 'lni-locked-1', label: 'Blocked'},
    pending: {color: HEALTH_COLORS.pending, icon: 'lni-hourglass', label: 'Pending'},
};

const stateConf = (state) => ANSWER_STATE_CONFIG[state] ?? ANSWER_STATE_CONFIG.pending;

// ── PlanRow ───────────────────────────────────────────────────────────────────

const PlanRow = ({plan}) => {
    const {t} = useTranslation();
    const cfg = PLAN_STATE_CONFIG[plan.state] ?? PLAN_STATE_CONFIG.draft;
    const planId = plan.id ?? plan['@id']?.split('/').pop();
    const dueDate = plan.dueDate ? formatDate(plan.dueDate) : null;

    return (
        <NavLink className="tp-plan-row" to={`/app/project/testing_plans/${planId}`}>
            <div className="tp-plan-icon" style={{background: cfg.iconBg}}>
                <i className={`font-icon lni ${cfg.icon}`} style={{color: cfg.iconColor}}/>
            </div>
            <div className="tp-plan-info">
                <span className="tp-plan-name">{plan.name}</span>
                {dueDate && (
                    <span className="tp-plan-meta">
                        <i className="font-icon lni lni-calendar-1" style={{fontSize: '.65rem', marginRight: '.2rem'}}/>
                        {t('Due')}: {dueDate}
                    </span>
                )}
            </div>
            <span className={`tp-plan-badge ${cfg.badgeClass}`}>
                {t(cfg.label)}
            </span>
        </NavLink>
    );
};

// ── PlansTab ──────────────────────────────────────────────────────────────────

const PlansTab = ({testerIri, state}) => {
    const {t} = useTranslation();
    const {data: plans = [], isLoading} = useAssignedTestPlans(
        testerIri,
        {state},
    );

    if (isLoading) {
        return (
            <div className="tp-plans-empty">
                <div className="spinner-border spinner-border-sm text-secondary me-2"/>
                {t('Loading…')}
            </div>
        );
    }

    if (plans.length === 0) {
        return <div className="tp-plans-empty">{t('No plans found.')}</div>;
    }

    return (
        <div className="tp-plan-list">
            {plans.map(plan => (
                <PlanRow key={plan.id ?? plan['@id']} plan={plan}/>
            ))}
        </div>
    );
};

// ── ActivityFeed ──────────────────────────────────────────────────────────────

const ActivityFeed = ({testerIri, projectId}) => {
    const {t} = useTranslation();
    const [page, setPage] = useState(1);

    const {data, isLoading} = useAnswersByTester(testerIri, projectId, page);
    const answers = data?.['member'] ?? data?.['hydra:member'] ?? [];
    const total = data?.['totalItems'] ?? data?.['hydra:totalItems'] ?? 0;
    const totalPages = Math.ceil(total / 10);

    if (isLoading) {
        return (
            <div className="tp-activity-loading">
                <div className="spinner-border spinner-border-sm text-secondary me-2"/>
                {t('Loading activity…')}
            </div>
        );
    }

    if (answers.length === 0) {
        return <div className="tp-activity-empty">{t('No activity yet.')}</div>;
    }

    return (
        <>
            <div className="tp-activity-list">
                {answers.map(answer => {
                    const cfg = stateConf(answer.state);
                    const answerId = answer.id ?? answer['@id']?.split('/').pop();
                    const commentExcerpt = answer.comment
                        ? answer.comment.replace(/[#*_`>[\]]/g, '').slice(0, 80) + (answer.comment.length > 80 ? '…' : '')
                        : null;

                    return (
                        <NavLink
                            key={answer.id ?? answer['@id']}
                            className="tp-activity-row"
                            to={`/app/project/answers/${answerId}`}
                        >
                            <div
                                className="tp-activity-dot"
                                style={{background: cfg.color + '18', color: cfg.color}}
                            >
                                <i className={`font-icon lni ${cfg.icon}`}/>
                            </div>
                            <div className="tp-activity-info">
                                <span className="tp-activity-title">
                                    {t('Answer')} #{answerId}
                                </span>
                                {commentExcerpt && (
                                    <span className="tp-activity-sub">{commentExcerpt}</span>
                                )}
                            </div>
                            <span
                                className="tp-activity-badge"
                                style={{
                                    background: cfg.color + '18',
                                    color: cfg.color,
                                    border: `1px solid ${cfg.color}40`,
                                }}
                            >
                                {t(cfg.label)}
                            </span>
                            <span className="tp-activity-time">
                                {relativeTime(answer.created)}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
            {totalPages > 1 && (
                <div className="tp-pagination">
                    <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
                </div>
            )}
        </>
    );
};

// ── PlanEnrollSearch ──────────────────────────────────────────────────────────

const PlanEnrollSearch = ({testerIri}) => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [focusedIdx, setFocusedIdx] = useState(0);
    const inputRef = useRef(null);
    const debouncedQuery = useDebounce(query, 300);
    const updateTestPlan = useUpdateTestPlan();

    useEffect(() => {
        if (open) {
            setQuery('');
            setFocusedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const searchEnabled = debouncedQuery.trim().length >= 2 && !!currentProject?.id;

    const {data: results = [], isFetching} = useQuery({
        queryKey: ['plan-enroll-search', currentProject?.id, debouncedQuery],
        queryFn: () =>
            TestPlansService.getTestPlans({
                project: currentProject.id,
                name: debouncedQuery,
                itemsPerPage: 5,
            }).then(r => (r.data['member'] ?? []).slice(0, 5)),
        enabled: searchEnabled,
        staleTime: 30_000,
    });

    useEffect(() => {
        setFocusedIdx(0);
    }, [results]);

    const handleSelect = (plan) => {
        const existing = (plan.testersEnrolled ?? []).map(t =>
            typeof t === 'string' ? t : t['@id'] ?? `/api/testers/${t.id}`
        );
        if (existing.includes(testerIri)) {
            toast.error(t('Tester is already enrolled in this plan.'));
            return;
        }
        updateTestPlan.mutate(
            {id: plan.id, data: {testersEnrolled: [...existing, testerIri]}},
            {
                onSuccess: () => {
                    toast.success(t('Tester enrolled in plan.'));
                    setOpen(false);
                    setQuery('');
                },
                onError: () => toast.error(t('Failed to enroll tester.')),
            }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIdx(i => Math.min(i + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIdx(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && results[focusedIdx]) {
            handleSelect(results[focusedIdx]);
        }
    };

    if (!open) {
        return (
            <button className="btn btn-sm btn-light pes-add-btn" onClick={() => setOpen(true)}
                    title={t('Enroll in plan')}>
                <i className="font-icon lni lni-plus"/>
            </button>
        );
    }

    return (
        <div className="pes-wrap">
            <div className="pes-input-wrap">
                <i className={`font-icon lni ${isFetching ? 'lni-spinner-3 lni-is-spinning' : 'lni-search-1'} pes-icon`}/>
                <input
                    ref={inputRef}
                    className="pes-input"
                    type="text"
                    placeholder={t('Search test plans…')}
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setFocusedIdx(0);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={updateTestPlan.isPending}
                />
                {searchEnabled && results.length > 0 && (
                    <div className="pes-dropdown">
                        {results.map((plan, i) => (
                            <button
                                key={plan.id}
                                className={`search-result-item${i === focusedIdx ? ' is-focused' : ''}`}
                                onMouseDown={() => handleSelect(plan)}
                                onMouseEnter={() => setFocusedIdx(i)}
                            >
                                <span className="search-result-icon-wrap">
                                    <i className="font-icon lni lni-clipboard"/>
                                </span>
                                <span className="search-result-body">
                                    <span className="search-result-name">{plan.name}</span>
                                </span>
                                <span className="search-result-type">{t('Testing Plan')}</span>
                                <i className="font-icon lni lni-arrow-right search-result-arrow"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button className="btn btn-sm btn-light pes-close-btn" onClick={() => setOpen(false)}>
                <i className="font-icon lni lni-xmark"/>
            </button>
        </div>
    );
};

// ── TesterInfoCard ────────────────────────────────────────────────────────────

const TesterInfoCard = ({tester}) => {
    const {t} = useTranslation();
    const updateTester = useUpdateTester();
    const [active, setActive] = useState(tester?.active ?? true);

    useEffect(() => {
        setActive(tester?.active ?? true);
    }, [tester?.active]);

    const isActive = active;
    const avatarUrl = tester?.profilePictureUrl;
    const testerId = tester?.id ?? tester?.['@id']?.split('/').pop();

    const handleToggle = () => {
        const next = !active;
        setActive(next);
        updateTester.mutate(
            {id: testerId, data: {active: next}},
            {
                onSuccess: () => toast.success(next ? t('Tester activated.') : t('Tester deactivated.')),
                onError: () => {
                    setActive(!next);
                    toast.error(t('Failed to update tester.'));
                },
            }
        );
    };

    return (
        <Card>
            <CardBody>
                <div className="tp-info-header">
                    <div className="tp-avatar tp-avatar--lg">
                        {avatarUrl
                            ? <img src={avatarUrl} alt={tester?.nickname ?? tester?.email ?? ''}
                                   className="tp-avatar-img"/>
                            : initials(tester?.nickname ?? tester?.email ?? '')
                        }
                    </div>
                    <div className="overflow-hidden">
                        {tester?.nickname && <p className="tp-info-name">{tester.nickname}</p>}
                        <p className={`tp-info-${tester?.nickname ? 'email' : 'name'}`}>{tester?.email ?? '—'}</p>
                        <p className="tp-info-type">{t('Tester')}</p>
                    </div>
                </div>

                <TesterTagEditor tags={tester?.tags ?? []} testerId={testerId} className="tte-root--separated"/>

                <div className="tp-info-rows">
                    {/* Active toggle */}
                    <div className="tp-info-row">
                        <span className="tp-info-label">{t('Status')}</span>
                        <div className="d-flex align-items-center gap-sm">
                            <span className={`tp-active-badge tp-active-badge--${isActive ? 'active' : 'inactive'}`}>
                                <i className={`font-icon lni ${isActive ? 'lni-check-circle-1' : 'lni-xmark-circle'}`}/>
                                {isActive ? t('Active') : t('Inactive')}
                            </span>
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={active}
                                    onChange={handleToggle}
                                    disabled={updateTester.isPending}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="tp-info-row">
                        <span className="tp-info-label">{t('Email')}</span>
                        <span className="tp-info-value" style={{fontSize: '.75rem', wordBreak: 'break-all'}}>
                            {tester?.email ?? '—'}
                        </span>
                    </div>

                    {/* Last active */}
                    <div className="tp-info-row">
                        <span className="tp-info-label">{t('Last active')}</span>
                        <span className="tp-info-value">
                            {tester?.lastActive ? relativeTime(tester.lastActive) : '—'}
                        </span>
                    </div>

                    {/* Active projects */}
                    <div className="tp-info-row">
                        <span className="tp-info-label">{t('Projects')}</span>
                        <span className="tp-info-value">
                            {tester?.activeProjects ?? tester?.projects?.length ?? '—'}
                        </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export const TesterProfile = () => {
    const {t} = useTranslation();
    const {testerId} = useParams();
    const navigate = useNavigate();
    const {currentProject} = useProjectStore();

    const {data: tester, isLoading, isError} = useTester(testerId);
    const deleteTester = useDeleteTester();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const testerIri = tester?.['@id'] ?? (testerId ? `/api/testers/${testerId}` : null);

    if (!currentProject?.id) {
        navigate('/app/');
        return null;
    }

    const handleConfirmDelete = () => {
        deleteTester.mutate(testerId, {
            onSuccess: () => {
                toast.success(t('Tester deleted.'));
                navigate('/app/project/testers');
            },
            onError: () => {
                setConfirmDeleteOpen(false);
                toast.error(t('Failed to delete tester.'));
            },
        });
    };

    if (isError) {
        return (
            <PageContentWrapper>
                <PageTitle
                    title={t('Tester not found')}
                    breadcrumbParents={[
                        {label: t('Testers'), path: '/app/project/testers'},
                    ]}
                    breadcrumbLabel={t('Not found')}
                />
            </PageContentWrapper>
        );
    }

    const displayEmail = tester?.email ?? `#${testerId}`;

    return (
        <PageContentWrapper>
            <PageTitle
                title={displayEmail}
                breadcrumbParents={[
                    {label: t('Testers'), path: '/app/project/testers'},
                ]}
                breadcrumbLabel={displayEmail}
            >
                <Button
                    type="danger"
                    outline
                    size="sm"
                    icon="lni-trash-3"
                    onClick={() => setConfirmDeleteOpen(true)}
                >
                    {t('Delete this tester')}
                </Button>
            </PageTitle>

            <ConfirmModal
                isVisible={confirmDeleteOpen}
                title={t('Delete this tester')}
                message={t('Delete tester {{email}}?', {email: displayEmail})}
                confirmLabel={t('Delete')}
                confirmIcon="lni-trash-3"
                loading={deleteTester.isPending}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

            <PageElementWrapper>
                {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '30vh'}}>
                        <div className="spinner-border text-primary"/>
                    </div>
                ) : (
                    <Row>
                        {/* ── Left: plans + activity ─────────────────── */}
                        <Col sm={12} xl={8}>
                            <Row>
                                {/* Plans */}
                                <Col size={12}>
                                    <Card>
                                        <CardHeader title={t('Enrolled plans')}>
                                            <PlanEnrollSearch testerIri={testerIri}/>
                                        </CardHeader>
                                        <CardBody>
                                            <TabWrapper name="tester-plans">
                                                <Tab
                                                    icon="lni-play"
                                                    name="active"
                                                    title={t('Active')}
                                                    active
                                                >
                                                    <PlansTab testerIri={testerIri} state="published"/>
                                                </Tab>
                                                <Tab
                                                    icon="lni-box-archive-1"
                                                    name="archived"
                                                    title={t('Archived')}
                                                >
                                                    <PlansTab testerIri={testerIri} state="archived"/>
                                                </Tab>
                                                <Tab
                                                    icon="lni-pencil-1"
                                                    name="draft"
                                                    title={t('Draft')}
                                                >
                                                    <PlansTab testerIri={testerIri} state="draft"/>
                                                </Tab>
                                            </TabWrapper>
                                        </CardBody>
                                    </Card>
                                </Col>

                                {/* Activity feed */}
                                <Col size={12}>
                                    <Card>
                                        <CardHeader title={t('Activity')}/>
                                        <CardBody>
                                            <ActivityFeed
                                                testerIri={testerIri}
                                                projectId={currentProject.id}
                                            />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        {/* ── Right: tester info + annotations ──────── */}
                        <Col sm={12} xl={4}>
                            <Row>
                                <Col size={12}>
                                    {tester && <TesterInfoCard tester={tester}/>}
                                </Col>
                                <Col size={12}>
                                    <Card>
                                        <CardHeader title={t('Annotations')}/>
                                        <CardBody>
                                            <TesterAnnotations testerIri={testerIri}/>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                )}
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
