import {useMemo, useState} from "react";
import {useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {useQueries} from "@tanstack/react-query";
import {PageContentWrapper} from "../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../Components/Navigation/PageElementWrapper.jsx";
import {Loader} from "../../Components/UI/Loader.jsx";
import {useAuthStore} from "../../Store/auth.js";
import {useAssignedTestPlans, useTestPlanProgression} from "../../Hooks/queries/useTestPlansQuery.js";
import ReleasesService from "../../Services/PrivateApi/ReleasesService.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const daysUntil = (iso) => {
    if (!iso) return null;
    const diff = new Date(iso) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

// Dynamic — kept inline intentionally
const urgencyBorderColor = (days) => {
    if (days === null) return '#dee2e6';
    if (days <= 3) return '#dc3545';
    if (days <= 7) return '#fd7e14';
    return '#69BC9E';
};

// ── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = ({icon, iconColor, label, value}) => (
    <div className="td-stat-card">
        <div className="td-stat-icon" style={{background: iconColor + '18'}}>
            <i className={`font-icon ${icon}`} style={{color: iconColor}}/>
        </div>
        <div>
            <div className="td-stat-label">{label}</div>
            <div className="td-stat-value">{value}</div>
        </div>
    </div>
);

// ── Badges ────────────────────────────────────────────────────────────────────

const StatusBadge = ({state, days, t}) => {
    if (state === 'archived') return <span className="td-badge td-badge--archived">{t('Archived')}</span>;
    if (days !== null && days < 0) return <span className="td-badge td-badge--overdue">{t('Overdue')}</span>;
    if (days !== null && days >= 0 && days <= 7) return <span
        className="td-badge td-badge--due-soon">{t('Due soon')}</span>;
    if (state === 'published') return <span className="td-badge td-badge--in-progress">{t('In progress')}</span>;
    return <span className="td-badge td-badge--not-started">{t('Not started')}</span>;
};

// ── PlanRow ───────────────────────────────────────────────────────────────────

const PlanRow = ({plan, t, projectName}) => {
    const navigate = useNavigate();
    const days = daysUntil(plan.dueDate);
    const planId = typeof plan.id === 'string' ? plan.id.split('/').pop() : plan.id;
    const {data: progression} = useTestPlanProgression(planId);
    const progress = Math.round(progression?.progression ?? 0);

    const relativeLabel = () => {
        if (days < 0) return t('{{count}} days ago', {count: Math.abs(days)});
        if (days === 0) return t('Today');
        return t('in {{count}} days', {count: days});
    };

    return (
        <div
            className="td-plan-row"
            style={{borderLeft: `4px solid ${urgencyBorderColor(days)}`}}
            onClick={() => navigate(`/testing/plans/${planId}`)}
        >
            {/* Thumbnail */}
            <div className="td-plan-thumb">
                <img src="/assets/testing_open.jpg" alt=""/>
            </div>

            {/* Info */}
            <div className="td-plan-info">
                <div className="td-plan-title-row">
                    <span className="td-plan-name">{plan.name}</span>
                </div>
                {plan.description && (
                    <p className="td-plan-desc">{plan.description}</p>
                )}
                <div className="td-plan-meta">
                    <span>
                        <i className="font-icon lni lni-check-square-2"/>
                        {plan.totalQuestions ?? 0} {t(plan.totalQuestions !== 1 ? 'scenarios' : 'scenario')}
                    </span>
                    {projectName && (
                        <span>
                            <i className="font-icon lni lni-folder"/>
                            {projectName}
                        </span>
                    )}
                    {plan.release?.name && (
                        <span>
                            <i className="font-icon lni lni-git"/>
                            {plan.release.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="td-plan-progress">
                <div className="td-plan-progress-header">
                    <span>{t('Progress')}</span>
                    <span>{progress}%</span>
                </div>
                <div className="td-plan-progress-track">
                    <div className="td-plan-progress-fill" style={{width: `${progress}%`}}/>
                </div>
            </div>

            {/* Due date */}
            <div className="td-plan-due">
                <div className="td-plan-due-label">{t('Due date')}</div>
                {plan.dueDate ? (
                    <>
                        <div className={`td-plan-due-date${days !== null && days <= 7 ? ' is-urgent' : ''}`}>
                            <i className="font-icon lni lni-calendar-days"/>
                            {formatDate(plan.dueDate)}
                        </div>
                        {days !== null && (
                            <div
                                className={`td-plan-due-rel ${days < 0 ? 'is-overdue' : days <= 7 ? 'is-soon' : 'is-ok'}`}>
                                {relativeLabel()}
                            </div>
                        )}
                    </>
                ) : (
                    <span className="td-plan-due-none">{t('No due date')}</span>
                )}
            </div>

            {/* Status */}
            <div className="td-plan-status-col">
                <StatusBadge state={plan.state} days={days} t={t}/>
            </div>

            <i className="font-icon lni lni-chevron-right" style={{color: '#adb5bd', flexShrink: 0}}/>
        </div>
    );
};

// ── Home ──────────────────────────────────────────────────────────────────────

export const Home = () => {
    const {t} = useTranslation();
    const {user} = useAuthStore();
    const testerIri = user?.['@id'] ?? null;

    const {data: plans = [], isLoading} = useAssignedTestPlans(testerIri, {}, {refetchOnMount: 'always', staleTime: 0});

    // Fetch full release objects to get project.name (not included in testPlan:read group)
    const releaseIds = useMemo(() => {
        const ids = new Set();
        plans.forEach(p => {
            if (p.release?.id) ids.add(p.release.id);
        });
        return [...ids];
    }, [plans]);

    const releaseQueries = useQueries({
        queries: releaseIds.map(id => ({
            queryKey: ['release', id],
            queryFn: () => ReleasesService.getRelease(id).then(r => r.data),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const projectByReleaseId = useMemo(() => {
        const map = {};
        releaseQueries.forEach((q, i) => {
            if (q.data) map[releaseIds[i]] = q.data.project?.name ?? null;
        });
        return map;
    }, [releaseQueries, releaseIds]);

    const [statusFilter, setStatusFilter] = useState('all');
    const [sortAsc, setSortAsc] = useState(true);

    const activePlans = plans.filter(p => p.state === 'published');
    const dueSoonCount = activePlans.filter(p => {
        const d = daysUntil(p.dueDate);
        return d !== null && d >= 0 && d <= 7;
    }).length;
    const inProgressCount = activePlans.filter(p => p.state === 'published').length;

    const STATUS_FILTERS = [
        {key: 'all', label: t('All')},
        {key: 'due_soon', label: t('Due soon')},
    ];

    const displayed = useMemo(() => {
        let list = plans.filter(p => p.state === 'published');
        if (statusFilter === 'due_soon') list = list.filter(p => {
            const d = daysUntil(p.dueDate);
            return d !== null && d >= 0 && d <= 7;
        });

        list.sort((a, b) => {
            const da = a.dueDate ? new Date(a.dueDate) : Infinity;
            const db = b.dueDate ? new Date(b.dueDate) : Infinity;
            return sortAsc ? da - db : db - da;
        });
        return list;
    }, [plans, statusFilter, sortAsc]);

    return (
        <PageContentWrapper>
            <PageTitle breadcrumbLabel={<span
                style={{fontSize: 14, color: '#6c757d'}}>{t('Here are the testing plans assigned to you.')}</span>}
                       title={t('My Dashboard')}/>
            <PageElementWrapper>
                <div className="d-flex flex-column gap-lg">

                    {/* Hero */}
                    <div className="td-hero">
                        <div>
                            <h2>{t('Hey there! 👋')}</h2>
                            <p>
                                {t('Ready to test some awesome features?')}<br/>
                                {t('Pick a plan and start answering scenarios.')}
                            </p>
                        </div>
                        <div className="td-hero-image">
                            <img src="/assets/desert2.png" alt=""/>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="td-stats-row">
                        <StatCard icon="lni lni-clipboard" iconColor="#6366f1" label={t('Assigned plans')}
                                  value={activePlans.length}/>
                        <StatCard icon="lni lni-alarm-1" iconColor="#f59e0b" label={t('Due soon')}
                                  value={dueSoonCount}/>
                        <StatCard icon="lni lni-check-circle-1" iconColor="#3b82f6" label={t('In progress')}
                                  value={inProgressCount}/>
                    </div>

                    {/* Plans */}
                    <div>
                        <div className="td-plans-header">
                            <h3>{t('My Testing Plans')}</h3>
                            <div className="td-plans-controls">
                                <select
                                    className="td-plans-control-select"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    {STATUS_FILTERS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                                </select>
                                <button className="td-plans-control-btn" onClick={() => setSortAsc(a => !a)}>
                                    <i className="font-icon lni lni-calendar-days"/>
                                    {t('Due date')}
                                    <i className={`font-icon lni lni-arrow-${sortAsc ? 'upward' : 'downward'}`}/>
                                </button>
                            </div>
                        </div>

                        <div className="td-plans-list">
                            {isLoading && <Loader/>}
                            {!isLoading && displayed.length === 0 && (
                                <div className="td-plans-empty">
                                    <i className="font-icon lni lni-clipboard"/>
                                    {t('No testing plans found.')}
                                </div>
                            )}
                            {displayed.map(plan => (
                                <PlanRow
                                    key={plan.id}
                                    plan={plan}
                                    t={t}
                                    projectName={projectByReleaseId[plan.release?.id] ?? null}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="td-footer-help">
                        <img src="/assets/gator_avatar.png" alt=""/>
                        {t('Have a question or need help?')}{' '}
                        <a href="mailto:">{t('Reach out to your QA team.')}</a>
                    </div>

                </div>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
