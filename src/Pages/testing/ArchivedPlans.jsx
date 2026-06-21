import {useMemo} from "react";
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

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

// ── ArchivedPlanRow ───────────────────────────────────────────────────────────

const ArchivedPlanRow = ({plan, t, projectName}) => {
    const navigate = useNavigate();
    const planId = typeof plan.id === 'string' ? plan.id.split('/').pop() : plan.id;
    const {data: progression} = useTestPlanProgression(planId);
    const progress = Math.round(progression?.progression ?? 0);

    return (
        <div
            className="td-plan-row td-plan-row--archived"
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
                    <span className="td-badge td-badge--archived">{t('Archived')}</span>
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
                    <div className="td-plan-due-date">
                        <i className="font-icon lni lni-calendar-days"/>
                        {formatDate(plan.dueDate)}
                    </div>
                ) : (
                    <span className="td-plan-due-none">{t('No due date')}</span>
                )}
            </div>

            <i className="font-icon lni lni-chevron-right" style={{color: '#adb5bd', flexShrink: 0}}/>
        </div>
    );
};

// ── ArchivedPlans ─────────────────────────────────────────────────────────────

export const ArchivedPlans = () => {
    const {t} = useTranslation();
    const {user} = useAuthStore();
    const testerIri = user?.['@id'] ?? null;

    const {data: plans = [], isLoading} = useAssignedTestPlans(
        testerIri,
        {state: 'archived'},
        {refetchOnMount: 'always', staleTime: 0}
    );

    // Fetch release objects to resolve project names
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

    return (
        <PageContentWrapper>
            <PageTitle
                title={t('Archived Plans')}
                breadcrumbLabel={
                    <span style={{fontSize: 14, color: '#6c757d'}}>
                        {t('Testing plans that have been archived.')}
                    </span>
                }
            />
            <PageElementWrapper>
                <div className="td-plans-list">
                    {isLoading && <Loader/>}
                    {!isLoading && plans.length === 0 && (
                        <div className="td-plans-empty">
                            <i className="font-icon lni lni-archive"/>
                            {t('No archived plans.')}
                        </div>
                    )}
                    {plans.map(plan => (
                        <ArchivedPlanRow
                            key={plan.id}
                            plan={plan}
                            t={t}
                            projectName={projectByReleaseId[plan.release?.id] ?? null}
                        />
                    ))}
                </div>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
