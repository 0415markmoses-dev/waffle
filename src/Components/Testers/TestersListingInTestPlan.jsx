'use client';

import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {useCallback, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import {PaginationSettings} from '../../Configs/PaginationSettings.js';
import {ColumnSizing} from '../../Configs/AgGrid/ColumnSizing.js';
import {RowDataUpdate} from '../../Configs/AgGrid/RowDataUpdate.js';
import {useProjectStore} from '../../Store/PrivateData/ProjectsStore.js';
import {useTesters} from '../../Hooks/queries/useTestersQuery.js';
import {useUpdateTestPlan} from '../../Hooks/queries/useTestPlansQuery.js';
import AnswersService from '../../Services/PrivateApi/AnswersService.js';

ModuleRegistry.registerModules([AllCommunityModule]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = '/assets/gator_avatar.png';

const initials = (str = '') => {
    const s = typeof str === 'string' ? str : '';
    const parts = s.split(/[\s@._-]+/).filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
};

// ── Portal tooltip ────────────────────────────────────────────────────────────

const Tooltip = ({label, children}) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({top: 0, left: 0});
    const ref = useRef(null);

    const show = () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setCoords({
            top: rect.top + window.scrollY - 6,
            left: rect.left + rect.width / 2 + window.scrollX,
        });
        setVisible(true);
    };

    return (
        <>
            <span ref={ref} onMouseEnter={show} onMouseLeave={() => setVisible(false)}
                  style={{display: 'inline-flex', alignItems: 'center'}}>
                {children}
            </span>
            {visible && createPortal(
                <div className="lt-tooltip-portal" style={{top: coords.top, left: coords.left}}>
                    {label}
                </div>,
                document.body
            )}
        </>
    );
};

// ── Cell renderers ────────────────────────────────────────────────────────────

const AvatarCellRenderer = ({data}) => {
    const avatarUrl = data?.profilePictureUrl;
    const label = data?.nickname ?? data?.email ?? '';
    const isDefault = !avatarUrl || avatarUrl === DEFAULT_AVATAR;
    return (
        <div className="lt-avatar">
            {!isDefault
                ? <img src={avatarUrl} alt={label} className="lt-avatar-img"/>
                : <span>{initials(label)}</span>
            }
        </div>
    );
};

const ProgressCellRenderer = ({data, context}) => {
    const {testPlan} = context;
    const testerIri = data?.['@id'] ?? (data?.id ? `/api/testers/${data.id}` : null);
    const planId = testPlan?.id;
    const totalQuestions = testPlan?.totalQuestions ?? 0;

    const {data: answersData} = useQuery({
        queryKey: ['tester-plan-progress', testerIri, planId],
        queryFn: () =>
            AnswersService.getAnswers({
                tester: testerIri,
                'question.plan': `/api/test_plans/${planId}`,
                itemsPerPage: 1,
                page: 1,
            }).then(r => r.data),
        enabled: !!testerIri && !!planId,
        staleTime: 60_000,
    });

    const answered = answersData?.totalItems ?? 0;
    const pct = totalQuestions > 0 ? Math.min(100, Math.round((answered / totalQuestions) * 100)) : 0;

    return (
        <div className="tlitp-progress">
            <div className="tlitp-track">
                <div className="tlitp-fill" style={{width: `${pct}%`}}/>
            </div>
            <span className="tlitp-label">{answered}/{totalQuestions}</span>
        </div>
    );
};

const ActionsCellRenderer = ({data, context}) => {
    const {t} = useTranslation();
    const {onKick} = context;
    const [kicking, setKicking] = useState(false);

    const handleKick = async () => {
        if (kicking) return;
        if (!window.confirm(t('Remove this tester from the plan?'))) return;
        const testerIri = data?.['@id'] ?? (data?.id ? `/api/testers/${data.id}` : null);
        if (!testerIri) return;
        setKicking(true);
        try {
            await onKick(testerIri);
        } finally {
            setKicking(false);
        }
    };

    return (
        <div className="lt-actions">
            <Tooltip label={t('View profile')}>
                <NavLink to={'/app/project/testers/' + data.id} className="btn btn-sm btn-light lt-action-btn">
                    <i className="font-icon lni lni-eye"/>
                </NavLink>
            </Tooltip>
            <Tooltip label={t('Remove from plan')}>
                <button
                    className="btn btn-sm btn-light lt-action-btn lt-action-btn--danger"
                    onClick={handleKick}
                    disabled={kicking}
                >
                    <i className="font-icon lni lni-xmark"/>
                </button>
            </Tooltip>
        </div>
    );
};

// ── TestersListingInTestPlan ───────────────────────────────────────────────────

export const TestersListingInTestPlan = ({testPlan}) => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const gridRef = useRef();
    const updateTestPlan = useUpdateTestPlan();

    const {data: allTesters = [], isLoading} = useTesters({
        project: currentProject?.id,
        'order[id]': 'desc',
    });

    // Filter to only enrolled testers
    const enrolledIris = (testPlan?.testersEnrolled ?? []).map(e =>
        typeof e === 'string' ? e : e?.['@id'] ?? `/api/testers/${e.id}`
    );
    const rowData = allTesters.filter(tester =>
        enrolledIris.includes(tester?.['@id'] ?? `/api/testers/${tester.id}`)
    );

    const handleKick = (testerIri) =>
        new Promise((resolve, reject) => {
            const newEnrolled = enrolledIris.filter(iri => iri !== testerIri);
            updateTestPlan.mutate(
                {id: testPlan.id, data: {testersEnrolled: newEnrolled}},
                {
                    onSuccess: () => {
                        toast.success(t('Tester removed from plan.'));
                        resolve();
                    },
                    onError: () => {
                        toast.error(t('Failed to remove tester.'));
                        reject();
                    },
                }
            );
        });

    const context = {testPlan, onKick: handleKick};

    const [colDefs] = useState([
        {
            headerName: '',
            field: 'profilePictureUrl',
            width: 56,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: AvatarCellRenderer,
        },
        {field: 'email', headerName: t('Email'), filter: true, flex: 1, minWidth: 160},
        {field: 'nickname', headerName: t('Nickname'), filter: true, flex: 1, minWidth: 120},
        {
            headerName: t('Progress'),
            field: 'id',
            colId: 'progress',
            sortable: false,
            filter: false,
            flex: 1,
            minWidth: 180,
            cellRenderer: ProgressCellRenderer,
        },
        {
            headerName: t('Actions'),
            field: 'id',
            colId: 'actions',
            sortable: false,
            filter: false,
            width: 110,
            resizable: false,
            cellRenderer: ActionsCellRenderer,
        },
    ]);

    const onGridReady = useCallback(() => {
        gridRef.current?.api?.sizeColumnsToFit({defaultMinWidth: 100});
    }, []);

    return (
        <div className="w-100 position-relative grid-wrapper">
            <AgGridReact
                ref={gridRef}
                getRowId={RowDataUpdate.getRowId}
                loading={isLoading}
                autoSizeStrategy={ColumnSizing.autoSizeStrategy}
                paginationPageSize={PaginationSettings.paginationPageSize}
                paginationPageSizeSelector={PaginationSettings.paginationPageSizeSelector}
                pagination={true}
                columnDefs={colDefs}
                onGridReady={onGridReady}
                rowData={rowData}
                context={context}
            />
        </div>
    );
};

TestersListingInTestPlan.propTypes = {
    testPlan: PropTypes.object.isRequired,
};
